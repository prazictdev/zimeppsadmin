<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">Annual procurement plans</p>
        <h1 class="mt-1 text-xl font-bold">Plan regulatory workflow</h1>
        <p class="mt-1 text-sm text-base-content/55">Review procurement-entity plans across all workflow lanes.</p>
      </div>
      <label class="input input-sm w-full border-base-300 bg-base-100 lg:w-72">
        <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
        <input v-model.trim="searchInput" type="search" class="grow" placeholder="Search entity or registration no." @input="onSearchInput" />
      </label>
    </header>

    <div class="grid grid-cols-2 overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-4">
      <div v-for="(metric, index) in metrics" :key="metric.label" :class="['p-4', index < 3 ? 'border-r border-base-200' : '']">
        <div class="flex items-center justify-between gap-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/45">{{ metric.label }}</p>
          <Icon :name="metric.icon" class="h-4 w-4 text-base-content/35" />
        </div>
        <div v-if="store.summaryLoading" class="skeleton mt-2 h-8 w-16" />
        <p v-else class="mt-1 text-2xl font-semibold">{{ metric.value }}</p>
        <p class="mt-0.5 text-xs text-base-content/45">{{ metric.note }}</p>
      </div>
    </div>

    <div v-if="myQueueTotal" class="flex flex-col gap-3 rounded-xl border border-base-300 bg-base-100 p-4 sm:flex-row sm:items-center">
      <div class="mr-auto"><p class="font-semibold">My regulatory queue</p><p class="text-xs text-base-content/45">Plans currently waiting for your action</p></div>
      <button v-if="store.myQueue.handler" class="btn btn-sm btn-outline border-base-300" @click="activateLane('PENDING_ADMIN_AUTHORIZATION')"><Icon name="lucide:user-cog" /> Handler · {{ store.myQueue.handler }}</button>
      <button v-if="store.myQueue.manager" class="btn btn-sm btn-outline border-base-300" @click="activateLane('PENDING_MANAGER_REVIEW')"><Icon name="lucide:eye" /> Manager · {{ store.myQueue.manager }}</button>
      <button v-if="store.myQueue.approver" class="btn btn-sm btn-neutral" @click="activateLane('PENDING_APPROVER_DECISION')"><Icon name="lucide:check-circle" /> Approver · {{ store.myQueue.approver }}</button>
    </div>

    <div class="rounded-xl border border-base-300 bg-base-200/25 p-3">
      <div class="mb-3 flex items-center justify-between gap-3 px-1">
        <div><h2 class="font-bold">Workflow board</h2><p class="text-xs text-base-content/45">All workflow lanes load automatically</p></div>
        <button class="btn btn-ghost btn-sm" :disabled="activeLane.loading" @click="refreshActiveLane"><Icon name="lucide:refresh-cw" :class="['h-4 w-4', activeLane.loading ? 'animate-spin' : '']" /> Refresh lane</button>
      </div>

      <div role="tablist" aria-label="Plan workflow lanes" class="flex gap-3 overflow-x-auto pb-3">
        <article
          v-for="tab in tabs"
          :key="tab.key"
          role="tab"
          :aria-selected="store.filter === tab.key"
          :class="['flex w-[19rem] min-w-[19rem] flex-col overflow-hidden rounded-xl border bg-base-100 transition', store.filter === tab.key ? 'border-slate-500 shadow-md ring-1 ring-slate-400/30' : 'border-base-300']"
        >
          <button class="border-b border-base-200 p-4 text-left hover:bg-base-200/35" @click="activateLane(tab.key)">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <span :class="['mt-1 h-2.5 w-2.5 shrink-0 rounded-full', tab.dotClass]" />
                <div class="min-w-0"><h3 class="truncate text-sm font-bold">{{ tab.label }}</h3><p class="mt-0.5 text-xs text-base-content/45">{{ tab.description }}</p></div>
              </div>
              <span class="badge badge-ghost badge-sm shrink-0">{{ store.tabCounts[tab.key] ?? 0 }}</span>
            </div>
          </button>

          <div class="h-[30rem] flex-1 space-y-3 overflow-y-auto p-3">
            <div v-if="lane(tab.key).loading" class="grid min-h-48 place-items-center"><div class="text-center"><span class="loading loading-spinner loading-md" /><p class="mt-2 text-xs text-base-content/45">Loading lane…</p></div></div>

            <div v-else-if="lane(tab.key).error" class="alert alert-error text-sm"><Icon name="lucide:triangle-alert" /><span>{{ lane(tab.key).error }}</span></div>

            <button v-else-if="!lane(tab.key).loaded" class="flex min-h-48 w-full flex-col items-center justify-center rounded-lg border border-dashed border-base-300 p-6 text-center hover:border-slate-400 hover:bg-base-200/30" @click="activateLane(tab.key)">
              <Icon name="lucide:mouse-pointer-click" class="h-7 w-7 text-base-content/25" />
              <span class="mt-2 text-sm font-semibold">Click to load lane</span>
              <span class="mt-1 text-xs text-base-content/45">No records have been retrieved yet</span>
            </button>

            <div v-else-if="!lane(tab.key).companies.length" class="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-base-300 p-6 text-center">
              <Icon name="lucide:inbox" class="h-7 w-7 text-base-content/25" />
              <p class="mt-2 text-sm font-semibold">No entities in this lane</p>
              <p class="mt-1 text-xs text-base-content/45">{{ searchInput ? 'No records match your search.' : 'This workflow stage is clear.' }}</p>
            </div>

            <template v-else>
              <button
                v-for="company in lane(tab.key).companies"
                :key="company.id"
                type="button"
                :disabled="!company.current_plan_summary?.uuid"
                class="block w-full rounded-lg border border-base-300 bg-base-100 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow disabled:cursor-default disabled:hover:translate-y-0"
                @click="openPlan(company)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0"><p class="truncate text-sm font-bold">{{ company.name }}</p><p class="mt-0.5 truncate font-mono text-[0.68rem] text-base-content/45">{{ company.regnumber || 'No registration number' }}</p></div>
                  <span v-if="company.current_plan_summary?.year" class="badge badge-ghost badge-sm">{{ company.current_plan_summary.year }}</span>
                </div>
                <div class="mt-3 flex items-center justify-between gap-2 border-t border-base-200 pt-2">
                  <div class="flex min-w-0 items-center gap-1.5 text-xs text-base-content/55"><Icon name="lucide:user-round" class="h-3.5 w-3.5 shrink-0" /><span class="truncate">{{ officerName(company) }}</span></div>
                  <span :class="['shrink-0 text-xs', decayClass(company.time_in_state_days)]">{{ formatDecay(company.time_in_state_days) }}</span>
                </div>
                <div v-if="company.current_plan_summary?.is_revisit || !company.current_plan_summary" class="mt-2 flex gap-1">
                  <span v-if="company.current_plan_summary?.is_revisit" class="badge badge-warning badge-xs">Resubmission</span>
                  <span v-if="!company.current_plan_summary" class="badge badge-ghost badge-xs">No plan submitted</span>
                </div>
              </button>
            </template>
          </div>

          <footer v-if="lane(tab.key).loaded && lane(tab.key).meta.last_page > 1" class="flex items-center justify-between border-t border-base-200 p-3">
            <button class="btn btn-ghost btn-xs" :disabled="lane(tab.key).meta.current_page <= 1 || lane(tab.key).loading" @click="loadLanePage(tab.key, lane(tab.key).meta.current_page - 1)"><Icon name="lucide:chevron-left" /></button>
            <span class="text-[0.68rem] text-base-content/45">{{ lane(tab.key).meta.current_page }} / {{ lane(tab.key).meta.last_page }}</span>
            <button class="btn btn-ghost btn-xs" :disabled="lane(tab.key).meta.current_page >= lane(tab.key).meta.last_page || lane(tab.key).loading" @click="loadLanePage(tab.key, lane(tab.key).meta.current_page + 1)"><Icon name="lucide:chevron-right" /></button>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
const store = useAdminPlanDashboardStore()
const route = useRoute()

const tabs = [
  { key: 'PENDING_ADMIN_AUTHORIZATION', label: 'Authorization', description: 'Regulatory handler queue', dotClass: 'bg-slate-500' },
  { key: 'PENDING_MANAGER_REVIEW', label: 'Manager review', description: 'Recommendation review', dotClass: 'bg-slate-600' },
  { key: 'PENDING_APPROVER_DECISION', label: 'Approver decision', description: 'Final regulatory decision', dotClass: 'bg-slate-800' },
  { key: 'approved', label: 'Approved', description: 'Authorized or active plans', dotClass: 'bg-emerald-700' },
  { key: 'revisited', label: 'Resubmissions', description: 'Returned and submitted again', dotClass: 'bg-rose-700' },
]

const searchInput = ref(store.search)
let searchTimer = null

const submissionRate = computed(() => store.kpi.total_pes ? Math.round((store.kpi.pes_with_submissions / store.kpi.total_pes) * 100) : 0)
const myQueueTotal = computed(() => Number(store.myQueue.handler || 0) + Number(store.myQueue.manager || 0) + Number(store.myQueue.approver || 0))
const activeLane = computed(() => store.lane(store.filter))
const metrics = computed(() => [
  { label: 'Procurement entities', value: store.kpi.total_pes, note: 'Entities under regulation', icon: 'lucide:building-2' },
  { label: 'Plans submitted', value: store.kpi.pes_with_submissions, note: `${submissionRate.value}% submission coverage`, icon: 'lucide:file-check-2' },
  { label: 'Outstanding', value: store.kpi.pes_without_submissions, note: 'Entities without submissions', icon: 'lucide:file-clock' },
  { label: 'My queue', value: myQueueTotal.value, note: 'Plans waiting for your action', icon: 'lucide:inbox' },
])

const lane = key => store.lane(key)

async function activateLane(key) {
  await store.setFilter(key)
}

async function loadLanePage(key, page) {
  store.filter = key
  await store.loadLane(key, page)
}

async function refreshActiveLane() {
  await store.loadLane(store.filter, activeLane.value.meta.current_page || 1)
}

function openPlan(company) {
  if (company.current_plan_summary?.uuid) navigateTo(`/admin-plan-dashboard/plans/${company.current_plan_summary.uuid}`)
}

function officerName(company) {
  const officer = company.assigned_admin_user
  return officer ? `${officer.name} ${officer.lastname || ''}`.trim() : 'Unassigned'
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.setSearch(searchInput.value), 300)
}

function formatDecay(days) {
  if (days === null || days === undefined) return 'No activity'
  const roundedDays = Math.round(Number(days))
  if (roundedDays === 0) return 'Today'
  if (roundedDays === 1) return '1 day'
  return `${roundedDays} days`
}

function decayClass(days) {
  if (days === null || days === undefined) return 'text-base-content/40'
  const roundedDays = Math.round(Number(days))
  if (roundedDays >= 30) return 'font-semibold text-error'
  if (roundedDays >= 14) return 'font-semibold text-warning'
  return 'text-base-content/55'
}

onMounted(async () => {
  const requested = String(route.query.filter ?? '')
  const initialLane = [requested, store.filter].find(key => tabs.some(tab => tab.key === key)) ?? 'PENDING_ADMIN_AUTHORIZATION'
  store.filter = initialLane
  await Promise.all([store.loadSummary(), store.loadAllLanes(tabs.map(tab => tab.key))])
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>
