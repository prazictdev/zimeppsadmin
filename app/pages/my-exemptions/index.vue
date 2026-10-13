<template>
  <div class="space-y-5">
    <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>My exemptions</li></ul></div>

    <template v-if="canReview">
      <header class="rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div><div class="flex items-center gap-2"><Icon name="lucide:inbox" class="h-6 w-6 text-primary" /><h1 class="text-2xl font-bold">My exemptions</h1></div><p class="mt-1 text-sm text-base-content/60">Applications awaiting your action as the assigned handler.</p></div>
          <button class="btn btn-outline btn-sm" :disabled="loading" @click="load"><Icon name="lucide:refresh-cw" :class="['h-4 w-4', loading && 'animate-spin']" />Refresh</button>
        </div>
        <div class="mt-5 flex flex-wrap items-center gap-3"><div class="rounded-xl border border-base-200 px-4 py-3"><p class="text-xs text-base-content/50">Awaiting action</p><p class="text-2xl font-bold">{{ rows.length }}</p></div><div class="rounded-xl border border-base-200 px-4 py-3"><p class="text-xs text-base-content/50">Past 48-hour target</p><p class="text-2xl font-bold text-error">{{ overdueCount }}</p></div><label class="input ml-auto w-full max-w-md"><Icon name="lucide:search" class="h-4 w-4 opacity-50" /><input v-model.trim="search" type="search" placeholder="Search entity, title or APP year" /></label></div>
      </header>

      <div v-if="loading && !rows.length" class="flex justify-center py-16"><span class="loading loading-spinner loading-lg" /></div>
      <section v-else-if="filtered.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article v-for="row in filtered" :key="row.uuid" class="group rounded-2xl border border-base-200 bg-base-100 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div class="flex items-start justify-between gap-3"><span class="badge badge-info badge-outline">Awaiting handler</span><span :class="['badge gap-1', ageTone(row)]"><Icon name="lucide:timer" class="h-3.5 w-3.5" />{{ ageLabel(row) }}</span></div>
          <h2 class="mt-4 line-clamp-2 text-lg font-semibold">{{ row.title }}</h2>
          <p class="mt-2 flex items-center gap-2 text-sm text-base-content/65"><Icon name="lucide:building-2" class="h-4 w-4" />{{ row.company?.name || 'Procurement entity' }}</p>
          <div class="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-base-200/50 p-3 text-xs"><div><p class="text-base-content/45">APP year</p><p class="mt-1 font-semibold">{{ row.plan?.year || '—' }}</p></div><div><p class="text-base-content/45">Items</p><p class="mt-1 font-semibold">{{ row.items_count || 0 }}</p></div><div class="col-span-2"><p class="text-base-content/45">Submitted by</p><p class="mt-1 font-semibold">{{ person(row.creator) }}</p></div></div>
          <div class="mt-4"><div class="mb-1 flex justify-between text-[11px] text-base-content/45"><span>48-hour review target</span><span>{{ Math.round(decayPercent(row)) }}%</span></div><progress class="progress h-2 w-full" :class="progressTone(row)" :value="decayPercent(row)" max="100" /></div>
          <NuxtLink :to="`/exemptions/${row.uuid}`" class="btn btn-primary btn-sm mt-5 w-full">Review application<Icon name="lucide:arrow-right" class="h-4 w-4 transition group-hover:translate-x-1" /></NuxtLink>
        </article>
      </section>
      <div v-else class="rounded-2xl border border-dashed border-base-300 bg-base-100 py-16 text-center"><Icon name="lucide:circle-check-big" class="mx-auto h-10 w-10 text-success" /><h2 class="mt-3 font-semibold">Your handler queue is clear</h2><p class="mt-1 text-sm text-base-content/55">No exemption applications are currently awaiting your action.</p></div>
    </template>

    <div v-else-if="ready" class="alert alert-warning"><Icon name="lucide:lock" />You need <code>can.review.adminexemptions</code> to access your handler queue.</div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'My exemptions' });

const api = useExemptionHelper();
const toast = useToast();
const { can } = useCheckPermission();
const canReview = computed(() => can('can.review.adminexemptions'));
const rows = ref([]);
const search = ref('');
const loading = ref(false);
const ready = ref(false);
const clock = ref(Date.now());
let clockTimer;

const person = user => user ? ([user.name, user.lastname].filter(Boolean).join(' ') || user.email || 'User') : '—';
const filtered = computed(() => { const term = search.value.toLowerCase(); return rows.value.filter(row => !term || [row.title, row.company?.name, row.plan?.year].some(value => String(value || '').toLowerCase().includes(term))); });
const stageStartedAt = row => row.latest_transition?.created_at || row.updated_at || row.submitted_at || row.created_at;
const ageHours = row => { const started = new Date(stageStartedAt(row)).getTime(); return Number.isNaN(started) ? 0 : Math.max(0, (clock.value - started) / 3600000); };
const ageLabel = row => { const hours = ageHours(row); if (hours < 1) return `${Math.max(1, Math.floor(hours * 60))}m waiting`; if (hours < 24) return `${Math.floor(hours)}h waiting`; return `${Math.floor(hours / 24)}d ${Math.floor(hours % 24)}h waiting`; };
const decayPercent = row => Math.min(100, (ageHours(row) / 48) * 100);
const ageTone = row => ageHours(row) >= 48 ? 'badge-error' : ageHours(row) >= 29 ? 'badge-warning' : 'badge-success';
const progressTone = row => ageHours(row) >= 48 ? 'progress-error' : ageHours(row) >= 29 ? 'progress-warning' : 'progress-success';
const overdueCount = computed(() => rows.value.filter(row => ageHours(row) >= 48).length);

const load = async () => {
  loading.value = true;
  const { data, error } = await api.myHandlerQueue();
  loading.value = false;
  if (error || data?.status === false) { toast.error({ title: 'Could not load queue', message: error?.data?.message || data?.message || 'Your assigned exemptions could not be loaded.', position: 'topRight', layout: 2 }); return; }
  const payload = data?.data;
  rows.value = Array.isArray(payload) ? payload : (payload?.data ?? []);
};

onMounted(async () => { ready.value = true; if (canReview.value) await load(); clockTimer = window.setInterval(() => { clock.value = Date.now(); }, 60000); });
onBeforeUnmount(() => window.clearInterval(clockTimer));
</script>
