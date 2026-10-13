<template>
  <div class="space-y-5">
    <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Admin exemptions</li></ul></div>

    <template v-if="canAccess">
      <header class="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2"><Icon name="lucide:columns-3" class="h-6 w-6 text-primary" /><h1 class="text-2xl font-bold">Exemption applications</h1></div>
            <p class="mt-1 text-sm text-base-content/60">Track every application through the admin approval stages and identify queues that need attention.</p>
          </div>
          <button class="btn btn-outline btn-sm" :disabled="loading" @click="load"><Icon name="lucide:refresh-cw" :class="['h-4 w-4', loading && 'animate-spin']" />Refresh</button>
        </div>
        <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div class="stat rounded-xl border border-base-200 p-4"><div class="stat-title text-xs">Active applications</div><div class="stat-value text-2xl">{{ activeCount }}</div></div>
          <div class="stat rounded-xl border border-base-200 p-4"><div class="stat-title text-xs">Overdue stages</div><div class="stat-value text-2xl text-error">{{ overdueCount }}</div></div>
          <div class="stat rounded-xl border border-base-200 p-4"><div class="stat-title text-xs">Approved</div><div class="stat-value text-2xl text-success">{{ countStatus('APPROVED') }}</div></div>
          <div class="stat rounded-xl border border-base-200 p-4"><div class="stat-title text-xs">Returned to PE</div><div class="stat-value text-2xl text-warning">{{ countStatus('RETURNED') }}</div></div>
        </div>
        <label class="input mt-4 w-full max-w-lg"><Icon name="lucide:search" class="h-4 w-4 opacity-50" /><input v-model.trim="search" type="search" placeholder="Search title, entity, APP year or creator" /></label>
      </header>

      <div v-if="loading && !rows.length" class="flex justify-center py-16"><span class="loading loading-spinner loading-lg" /></div>
      <div v-else class="overflow-x-auto pb-4">
        <div class="grid min-w-[1480px] grid-cols-5 gap-4">
          <section v-for="column in columns" :key="column.key" class="rounded-2xl border border-base-200 bg-base-200/45 p-3">
            <header class="mb-3 flex items-center justify-between gap-2 px-1">
              <div class="flex items-center gap-2"><span :class="['grid h-8 w-8 place-items-center rounded-lg', column.iconClass]"><Icon :name="column.icon" class="h-4 w-4" /></span><div><h2 class="text-sm font-bold">{{ column.label }}</h2><p v-if="column.target" class="text-[11px] text-base-content/50">Target {{ column.target }}h</p></div></div>
              <span class="badge badge-neutral badge-sm">{{ cards(column).length }}</span>
            </header>

            <div class="space-y-3">
              <article v-for="row in cards(column)" :key="row.uuid" class="group rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div class="flex items-start justify-between gap-2"><span class="badge badge-outline badge-sm">APP {{ row.plan?.year || '—' }}</span><span v-if="column.target" :class="['badge badge-sm gap-1', ageTone(row, column)]"><Icon name="lucide:timer" class="h-3 w-3" />{{ ageLabel(row) }}</span><span v-else class="text-xs text-base-content/45">{{ closedLabel(row) }}</span></div>
                <h3 class="mt-3 line-clamp-2 font-semibold leading-5">{{ row.title }}</h3>
                <p class="mt-1 flex items-center gap-1 text-xs text-base-content/60"><Icon name="lucide:building-2" class="h-3.5 w-3.5" />{{ row.company?.name || 'Procurement entity' }}</p>
                <div class="mt-3 flex items-center justify-between text-xs text-base-content/55"><span class="flex items-center gap-1"><Icon name="lucide:list" class="h-3.5 w-3.5" />{{ row.items_count || 0 }} item{{ row.items_count === 1 ? '' : 's' }}</span><span>{{ person(row.creator) }}</span></div>
                <div v-if="column.target" class="mt-3"><div class="mb-1 flex justify-between text-[10px] text-base-content/45"><span>Stage time used</span><span>{{ Math.round(decayPercent(row, column)) }}%</span></div><progress class="progress h-1.5 w-full" :class="progressTone(row, column)" :value="decayPercent(row, column)" max="100" /></div>
                <div class="mt-4 border-t border-base-200 pt-3"><NuxtLink :to="`/exemptions/${row.uuid}`" class="btn btn-ghost btn-sm w-full justify-between">{{ canReview || canApprove ? 'Open application' : 'View application' }}<Icon name="lucide:arrow-right" class="h-4 w-4 transition group-hover:translate-x-1" /></NuxtLink></div>
              </article>
              <div v-if="!cards(column).length" class="rounded-xl border border-dashed border-base-300 bg-base-100/50 px-3 py-10 text-center text-xs text-base-content/45"><Icon name="lucide:inbox" class="mx-auto mb-2 h-6 w-6" />No applications in this stage</div>
            </div>
          </section>
        </div>
      </div>
    </template>

    <div v-else-if="ready" class="alert alert-warning"><Icon name="lucide:lock" />You need <code>can.access.adminexemptions</code> to access this board.</div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Admin exemptions' });

const api = useExemptionHelper();
const toast = useToast();
const { can } = useCheckPermission();
const canAccess = computed(() => can('can.access.adminexemptions'));
const canReview = computed(() => can('can.review.adminexemptions'));
const canApprove = computed(() => can('can.approve.adminexemptions'));
const rows = ref([]);
const search = ref('');
const loading = ref(false);
const ready = ref(false);
const clock = ref(Date.now());
let clockTimer;

const columns = [
  { key: 'handler', label: 'Admin review', statuses: ['PENDING_ADMIN_AUTHORIZATION'], target: 48, icon: 'lucide:user-search', iconClass: 'bg-info/15 text-info' },
  { key: 'reviewer', label: 'Reviewer', statuses: ['PENDING_MANAGER_REVIEW'], target: 24, icon: 'lucide:user-check', iconClass: 'bg-warning/15 text-warning' },
  { key: 'approver', label: 'Final decision', statuses: ['PENDING_APPROVER_DECISION'], target: 24, icon: 'lucide:badge-check', iconClass: 'bg-primary/15 text-primary' },
  { key: 'approved', label: 'Approved', statuses: ['APPROVED'], target: null, icon: 'lucide:circle-check-big', iconClass: 'bg-success/15 text-success' },
  { key: 'returned', label: 'Returned to PE', statuses: ['RETURNED'], target: null, icon: 'lucide:undo-2', iconClass: 'bg-error/15 text-error' },
];

const filtered = computed(() => {
  const term = search.value.toLowerCase();
  return rows.value.filter(row => !term || [row.title, row.company?.name, row.plan?.year, person(row.creator)].some(value => String(value || '').toLowerCase().includes(term)));
});
const cards = column => filtered.value.filter(row => column.statuses.includes(row.status));
const countStatus = status => rows.value.filter(row => row.status === status).length;
const activeCount = computed(() => rows.value.filter(row => columns.slice(0, 3).some(column => column.statuses.includes(row.status))).length);
const overdueCount = computed(() => rows.value.filter(row => { const column = columns.find(item => item.target && item.statuses.includes(row.status)); return column && ageHours(row) >= column.target; }).length);
const person = user => user ? ([user.name, user.lastname].filter(Boolean).join(' ') || user.email || 'User') : '—';
const stageStartedAt = row => row.latest_transition?.created_at || row.submitted_at || row.updated_at || row.created_at;
const ageHours = row => { const started = new Date(stageStartedAt(row)).getTime(); return Number.isNaN(started) ? 0 : Math.max(0, (clock.value - started) / 3600000); };
const ageLabel = row => { const hours = ageHours(row); if (hours < 1) return `${Math.max(1, Math.floor(hours * 60))}m`; if (hours < 24) return `${Math.floor(hours)}h`; const days = Math.floor(hours / 24); const remainder = Math.floor(hours % 24); return `${days}d ${remainder}h`; };
const closedLabel = row => { const value = stageStartedAt(row); if (!value) return '—'; const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-ZW', { dateStyle: 'medium' }); };
const decayPercent = (row, column) => Math.min(100, (ageHours(row) / column.target) * 100);
const ageTone = (row, column) => { const ratio = ageHours(row) / column.target; return ratio >= 1 ? 'badge-error' : ratio >= 0.6 ? 'badge-warning' : 'badge-success'; };
const progressTone = (row, column) => { const ratio = ageHours(row) / column.target; return ratio >= 1 ? 'progress-error' : ratio >= 0.6 ? 'progress-warning' : 'progress-success'; };

const load = async () => {
  loading.value = true;
  const { data, error } = await api.board();
  loading.value = false;
  if (error || data?.status === false) {
    toast.error({ title: 'Could not load board', message: error?.data?.message || data?.message || 'The exemption applications could not be loaded.', position: 'topRight', layout: 2 });
    return;
  }
  const payload = data?.data;
  rows.value = Array.isArray(payload) ? payload : (payload?.data ?? []);
};

onMounted(async () => {
  ready.value = true;
  if (canAccess.value) await load();
  clockTimer = window.setInterval(() => { clock.value = Date.now(); }, 60000);
});
onBeforeUnmount(() => window.clearInterval(clockTimer));
</script>
