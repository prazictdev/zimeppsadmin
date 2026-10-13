<template>
  <div class="space-y-5">
    <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>SPOC workflow</li></ul></div>
    <header class="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div><h1 class="flex items-center gap-2 text-2xl font-bold"><Icon name="lucide:columns-3" class="text-primary" />SPOC submissions</h1><p class="mt-1 text-sm text-base-content/60">Assignment, internal review, committee agenda, record confirmation and resolution in one traceable board.</p><p class="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">{{ currentYear }} workflow statistics · {{ rows.length }} total submission{{ rows.length === 1 ? '' : 's' }}</p></div>
        <div class="flex gap-2"><NuxtLink to="/spoc-agendas" class="btn btn-outline btn-sm"><Icon name="lucide:calendar-range" />Agendas</NuxtLink><button class="btn btn-outline btn-sm" :disabled="loading" @click="load"><Icon name="lucide:refresh-cw" :class="loading && 'animate-spin'" />Refresh</button></div>
      </div>
      <div class="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div v-for="column in columns" :key="`summary-${column.key}`" class="rounded-xl border border-base-200 bg-base-200/35 p-3"><div class="flex items-start justify-between gap-2"><div><p class="text-[11px] font-semibold uppercase tracking-wide text-base-content/50">{{ column.label }}</p><p class="mt-1 text-xs text-base-content/50">{{ column.help }}</p></div><span :class="['grid h-9 min-w-9 place-items-center rounded-lg px-2 text-lg font-bold', summaryTone(column.key)]">{{ countStage(column.key) }}</span></div></div>
      </div>
      <label class="input mt-4 w-full max-w-xl"><Icon name="lucide:search" /><input v-model.trim="search" type="search" placeholder="Search reference, tender or procurement entity" /></label>
    </header>
    <div v-if="loading && !rows.length" class="flex justify-center py-20"><span class="loading loading-spinner loading-lg" /></div>
    <div v-else class="overflow-x-auto pb-4">
      <div class="grid min-w-[2600px] grid-cols-9 gap-3">
        <section v-for="column in columns" :key="column.key" class="rounded-2xl border border-base-200 bg-base-200/40 p-3">
          <header class="mb-3 flex items-center justify-between"><div><h2 class="text-sm font-bold">{{ column.label }}</h2><p class="text-[11px] text-base-content/50">{{ column.help }}<span v-if="column.target"> · Target {{ column.target }}h</span></p></div><span class="badge badge-sm">{{ cards(column.key).length }}</span></header>
          <div class="space-y-3">
            <article v-for="row in cards(column.key)" :key="row.uuid" class="rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm">
              <div class="flex flex-wrap justify-between gap-2"><div class="flex gap-1"><span :class="['badge badge-xs', isOverdue(row) ? 'badge-error' : 'badge-outline']">{{ isOverdue(row) ? 'OVERDUE' : row.submission_type }}</span><span :class="['badge badge-xs', priorityBadge(row.priority)]">{{ priorityLabel(row.priority) }}</span></div><span class="text-[10px] text-base-content/50">{{ row.reference_number }}</span></div>
              <h3 class="mt-3 line-clamp-2 font-semibold">{{ row.tender?.title || 'Tender submission' }}</h3>
              <p class="mt-1 text-xs text-base-content/60">{{ row.tender?.tendernumber }}</p><p class="text-xs text-base-content/60">{{ row.tender?.company?.name }}</p>
              <div class="mt-3 text-xs"><span class="text-base-content/45">Assigned to</span><p class="font-medium">{{ person(row.current_assignee) }}</p></div>
              <div v-if="column.target" class="mt-4 rounded-lg bg-base-200/55 p-2.5"><div class="mb-1.5 flex items-center justify-between gap-2 text-[11px]"><span class="text-base-content/55">Time in stage</span><span :class="['font-semibold', decayText(row, column)]">{{ ageLabel(row) }} / {{ column.target }}h</span></div><progress :class="['progress h-1.5 w-full', decayProgress(row, column)]" :value="decayPercent(row, column)" max="100" /><p v-if="isStageOverdue(row, column)" class="mt-1.5 flex items-center gap-1 text-[10px] font-semibold text-error"><Icon name="lucide:clock-alert" class="h-3 w-3" />Overdue by {{ overdueLabel(row, column) }}</p></div>
              <NuxtLink :to="`/spoc-submissions/${row.uuid}`" class="btn btn-ghost btn-sm mt-3 w-full justify-between">Open case<Icon name="lucide:arrow-right" /></NuxtLink>
            </article>
            <div v-if="!cards(column.key).length" class="rounded-xl border border-dashed border-base-300 px-2 py-8 text-center text-xs text-base-content/40">No submissions</div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'SPOC submissions' });
const api = useSpocWorkflowHelper();
const toast = useToast();
const currentYear = new Date().getFullYear();
const rows = ref([]); const search = ref(''); const loading = ref(false); const clock = ref(Date.now());
let clockTimer;
const columns = [
  { key: 'SUBMITTED', label: 'New submissions', help: 'Awaiting assignment', target: 4 },
  { key: 'ASSIGNED_FOR_CASE_CREATION', label: 'Case creation', help: 'Procurement Specialist', target: 24 },
  { key: 'MANAGER_REVIEW', label: 'Manager review', help: 'Internal quality review', target: 8 },
  { key: 'AWAITING_APPROVAL', label: 'Awaiting approval', help: 'Director endorsement', target: 8 },
  { key: 'AWAITING_AGENDA', label: 'Awaiting agenda', help: 'Ready to schedule', target: 24 },
  { key: 'UNDER_REVIEW', label: 'Under review', help: 'Round Robin or Sitting', target: 48 },
  { key: 'AWAITING_RECORD_CONFIRMATION', label: 'Record confirmation', help: 'All attendees confirm', target: 24 },
  { key: 'AWAITING_RESOLUTION', label: 'Awaiting resolution', help: 'Confirmed committee record', target: 8 },
  { key: 'COMPLETED', label: 'Completed', help: 'Final resolution issued', target: null },
];
const filtered = computed(() => { const term = search.value.toLowerCase(); return rows.value.filter(row => !term || [row.reference_number, row.tender?.title, row.tender?.tendernumber, row.tender?.company?.name].some(value => String(value || '').toLowerCase().includes(term))); });
const cards = status => filtered.value.filter(row => row.status === status);
const countStage = status => rows.value.filter(row => row.status === status).length;
const summaryTone = status => ({ SUBMITTED: 'bg-info/15 text-info', ASSIGNED_FOR_CASE_CREATION: 'bg-primary/15 text-primary', MANAGER_REVIEW: 'bg-warning/15 text-warning', AWAITING_APPROVAL: 'bg-warning/20 text-warning', AWAITING_AGENDA: 'bg-secondary/15 text-secondary', UNDER_REVIEW: 'bg-accent/20 text-accent-content', AWAITING_RECORD_CONFIRMATION: 'bg-warning/15 text-warning', AWAITING_RESOLUTION: 'bg-primary/15 text-primary', COMPLETED: 'bg-success/15 text-success' }[status] || 'bg-base-200');
const currentAgenda = row => row.case?.agenda_items?.at(-1)?.agenda;
const isOverdue = row => { const agenda = currentAgenda(row); const deadlineOverdue = row.status === 'UNDER_REVIEW' && agenda?.decision_due_at && new Date(agenda.decision_due_at).getTime() < clock.value; const column = columns.find(item => item.key === row.status); return Boolean(deadlineOverdue || (column?.target && ageHours(row) >= column.target)); };
const priorityLabel = priority => ({ HIGH: 'High Priority', URGENT: 'Urgent', EXTREME: 'Extreme Priority' }[priority] || 'High Priority');
const priorityBadge = priority => ({ HIGH: 'badge-info badge-outline', URGENT: 'badge-warning', EXTREME: 'badge-error' }[priority] || 'badge-info badge-outline');
const stageStartedAt = row => row.latest_stage_event?.occurred_at || row.submitted_at || row.created_at;
const ageHours = row => { const started = new Date(stageStartedAt(row)).getTime(); return Number.isNaN(started) ? 0 : Math.max(0, (clock.value - started) / 3600000); };
const durationLabel = hours => { if (hours < 1) return `${Math.max(1, Math.floor(hours * 60))}m`; if (hours < 24) return `${Math.floor(hours)}h`; return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h`; };
const ageLabel = row => durationLabel(ageHours(row));
const decayPercent = (row, column) => Math.min(100, (ageHours(row) / column.target) * 100);
const decayRatio = (row, column) => ageHours(row) / column.target;
const isStageOverdue = (row, column) => decayRatio(row, column) >= 1;
const overdueLabel = (row, column) => durationLabel(ageHours(row) - column.target);
const decayProgress = (row, column) => decayRatio(row, column) >= 1 ? 'progress-error' : decayRatio(row, column) >= 0.75 ? 'progress-warning' : 'progress-success';
const decayText = (row, column) => decayRatio(row, column) >= 1 ? 'text-error' : decayRatio(row, column) >= 0.75 ? 'text-warning' : 'text-success';
const person = user => user ? [user.name, user.lastname].filter(Boolean).join(' ') || user.email : 'Unassigned';
const load = async () => { loading.value = true; const { data, error } = await api.board({ year: currentYear }); loading.value = false; if (error) return toast.error({ title: 'Could not load SPOC board', message: error?.data?.message || 'Please try again.' }); rows.value = data?.data ?? []; };
onMounted(async () => { await load(); clockTimer = window.setInterval(() => { clock.value = Date.now(); }, 60000); });
onBeforeUnmount(() => window.clearInterval(clockTimer));
</script>
