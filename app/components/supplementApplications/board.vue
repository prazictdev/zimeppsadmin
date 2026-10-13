<template>
  <section class="space-y-5">
    <header class="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">Annual plan amendments</p>
        <h1 class="mt-1 text-xl font-bold">Supplement applications</h1>
        <p class="mt-1 text-sm text-base-content/55">Track submitted supplements from handler review through authority authorization.</p>
      </div>
      <div class="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
        <label class="input input-sm w-full border-base-300 bg-base-100 sm:w-72">
          <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
          <input v-model.trim="searchInput" type="search" class="grow" placeholder="Search entity, requester or title" @input="queueSearch" />
        </label>
        <button :class="['btn btn-sm', store.assignedToMe ? 'btn-neutral' : 'btn-outline border-base-300']" @click="toggleAssignments">
          <Icon name="lucide:user-check" />{{ store.assignedToMe ? 'My assignments' : 'All applications' }}
        </button>
        <button class="btn btn-ghost btn-sm" :disabled="loading" @click="refresh"><Icon name="lucide:refresh-cw" :class="loading ? 'animate-spin' : ''" />Refresh</button>
      </div>
    </header>

    <div class="grid grid-cols-2 overflow-hidden rounded-xl border border-base-300 bg-base-100 lg:grid-cols-4">
      <div v-for="(metric, index) in metrics" :key="metric.label" :class="['p-4', index < metrics.length - 1 ? 'border-r border-base-200' : '']">
        <div class="flex items-center justify-between gap-3"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/45">{{ metric.label }}</p><Icon :name="metric.icon" class="h-4 w-4 text-base-content/35" /></div>
        <p class="mt-1 text-2xl font-semibold">{{ metric.value }}</p>
        <p class="mt-0.5 text-xs text-base-content/45">{{ metric.note }}</p>
      </div>
    </div>

    <div class="rounded-xl border border-base-300 bg-base-200/25 p-3">
      <div class="mb-3 px-1"><h2 class="font-bold">Application board</h2><p class="text-xs text-base-content/45">Each lane represents the action currently required.</p></div>
      <div class="flex gap-3 overflow-x-auto pb-3">
        <article v-for="column in columns" :key="column.status" class="flex w-[20rem] min-w-[20rem] flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100">
          <header class="border-b border-base-200 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <span :class="['mt-1 h-2.5 w-2.5 shrink-0 rounded-full', column.dotClass]" />
                <div class="min-w-0"><h3 class="truncate text-sm font-bold">{{ column.label }}</h3><p class="mt-0.5 text-xs text-base-content/45">{{ column.description }}</p></div>
              </div>
              <span class="badge badge-ghost badge-sm shrink-0">{{ lane(column.status).meta.total }}</span>
            </div>
          </header>

          <div class="h-[34rem] flex-1 space-y-3 overflow-y-auto p-3">
            <div v-if="lane(column.status).loading" class="grid min-h-48 place-items-center"><span class="loading loading-spinner loading-md" /></div>
            <div v-else-if="lane(column.status).error" class="alert alert-error text-sm"><Icon name="lucide:triangle-alert" /><span>{{ lane(column.status).error }}</span></div>
            <div v-else-if="!lane(column.status).applications.length" class="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-base-300 p-6 text-center">
              <Icon name="lucide:inbox" class="h-7 w-7 text-base-content/25" />
              <p class="mt-2 text-sm font-semibold">No applications</p>
              <p class="mt-1 text-xs text-base-content/45">{{ store.assignedToMe ? 'Nothing in this lane is assigned to you.' : 'This stage is currently clear.' }}</p>
            </div>

            <template v-else>
              <button v-for="application in lane(column.status).applications" :key="application.uuid" type="button" class="block w-full rounded-lg border border-base-300 bg-base-100 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow" @click="openApplication(application)">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0"><p class="truncate text-sm font-bold">{{ application.title || 'Untitled supplement' }}</p><p class="mt-0.5 truncate text-xs text-base-content/50">{{ application.plan?.company?.name || 'Unknown entity' }}</p></div>
                  <span class="badge badge-ghost badge-sm shrink-0">{{ application.plan?.year || '—' }}</span>
                </div>
                <p v-if="application.reason" class="mt-2 line-clamp-2 text-xs leading-relaxed text-base-content/55">{{ application.reason }}</p>
                <div class="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-base-200/45 p-2 text-xs">
                  <div><span class="block text-base-content/40">Items</span><span class="font-semibold">{{ application.items_count ?? 0 }}</span></div>
                  <div><span class="block text-base-content/40">Waiting</span><span :class="ageClass(application.updated_at)">{{ ageLabel(application.updated_at) }}</span></div>
                </div>
                <div class="mt-3 space-y-1.5 border-t border-base-200 pt-2 text-xs text-base-content/55">
                  <div class="flex items-center gap-1.5"><Icon name="lucide:user-round" class="h-3.5 w-3.5 shrink-0" /><span class="truncate">Requested by {{ userName(application.requester) }}</span></div>
                  <div class="flex items-center gap-1.5"><Icon name="lucide:user-check" class="h-3.5 w-3.5 shrink-0" /><span class="truncate">{{ assigneeLabel(application) }}</span></div>
                </div>
              </button>
            </template>
          </div>

          <footer v-if="lane(column.status).meta.last_page > 1" class="flex items-center justify-between border-t border-base-200 p-3">
            <button class="btn btn-ghost btn-xs" :disabled="lane(column.status).meta.current_page <= 1 || lane(column.status).loading" @click="store.loadLane(column.status, lane(column.status).meta.current_page - 1)"><Icon name="lucide:chevron-left" /></button>
            <span class="text-[0.68rem] text-base-content/45">{{ lane(column.status).meta.current_page }} / {{ lane(column.status).meta.last_page }}</span>
            <button class="btn btn-ghost btn-xs" :disabled="lane(column.status).meta.current_page >= lane(column.status).meta.last_page || lane(column.status).loading" @click="store.loadLane(column.status, lane(column.status).meta.current_page + 1)"><Icon name="lucide:chevron-right" /></button>
          </footer>
        </article>
      </div>
    </div>

    <AdminPlanDetailSupplementDetail
      v-if="selectedApplication"
      :plan-uuid="selectedApplication.plan.uuid"
      :supplement="selectedApplication"
      auto-open
      @closed="closeApplication"
    />
  </section>
</template>

<script setup>
const store = useSupplementApplicationStore()
const selectedApplication = ref(null)

const columns = [
  { status: 'PENDING_ADMIN_AUTHORIZATION', label: 'Handler review', description: 'Awaiting authority recommendation', dotClass: 'bg-sky-500' },
  { status: 'PENDING_MANAGER_REVIEW', label: 'Manager review', description: 'Awaiting recommendation review', dotClass: 'bg-indigo-500' },
  { status: 'PENDING_APPROVER_DECISION', label: 'Final decision', description: 'Awaiting authority approval', dotClass: 'bg-violet-600' },
  { status: 'AUTHORIZED', label: 'Authorized', description: 'Approved and merged into the plan', dotClass: 'bg-emerald-600' },
]
const statuses = columns.map(column => column.status)
const searchInput = ref(store.search)
let searchTimer = null

const lane = status => store.lane(status)
const loading = computed(() => columns.some(column => lane(column.status).loading))
const pendingTotal = computed(() => columns.filter(column => column.status !== 'AUTHORIZED').reduce((sum, column) => sum + Number(lane(column.status).meta.total || 0), 0))
const metrics = computed(() => [
  { label: 'Applications', value: statuses.reduce((sum, status) => sum + Number(lane(status).meta.total || 0), 0), note: store.assignedToMe ? 'In your current work queue' : 'Across submitted workflow stages', icon: 'lucide:files' },
  { label: 'Awaiting action', value: pendingTotal.value, note: 'Not yet authorized', icon: 'lucide:clock-3' },
  { label: 'Authority queue', value: ['PENDING_ADMIN_AUTHORIZATION', 'PENDING_MANAGER_REVIEW', 'PENDING_APPROVER_DECISION'].reduce((sum, status) => sum + Number(lane(status).meta.total || 0), 0), note: 'Handler, manager and approver', icon: 'lucide:landmark' },
  { label: 'Authorized', value: lane('AUTHORIZED').meta.total || 0, note: 'Merged into annual plans', icon: 'lucide:badge-check' },
])

function queueSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.setSearch(searchInput.value, statuses), 300)
}

const toggleAssignments = () => store.setAssignedToMe(!store.assignedToMe, statuses)
const refresh = () => store.reload(statuses)
const openApplication = application => { selectedApplication.value = application }
const closeApplication = () => {
  selectedApplication.value = null
  store.reload(statuses)
}

function userName(user) {
  return user ? ([user.name, user.lastname].filter(Boolean).join(' ') || user.email || 'Unknown') : 'Unknown'
}

function assigneeLabel(application) {
  if (application.status === 'PENDING_ADMIN_AUTHORIZATION') return `Handler: ${userName(application.plan?.company?.assigned_admin_user)}`
  if (application.status === 'PENDING_MANAGER_REVIEW') return `Manager: ${userName(application.latest_recommendation?.manager)}`
  if (application.status === 'PENDING_APPROVER_DECISION') return `Approver: ${userName(application.latest_recommendation?.approver)}`
  if (application.status === 'AUTHORIZED') return `Authorized by ${userName(application.decider)}`
  return 'No assignee'
}

function ageLabel(value) {
  if (!value) return 'Unknown'
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  if (days === 0) return 'Today'
  return `${days} day${days === 1 ? '' : 's'}`
}

function ageClass(value) {
  if (!value) return 'font-semibold'
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  if (days >= 14) return 'font-semibold text-error'
  if (days >= 7) return 'font-semibold text-warning'
  return 'font-semibold'
}

onMounted(() => store.loadAll(statuses))
onBeforeUnmount(() => clearTimeout(searchTimer))
</script>
