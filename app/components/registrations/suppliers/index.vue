<template>
  <section class="mt-3 space-y-4">
    <header class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <Icon name="lucide:columns-3" class="h-5 w-5 text-primary" />
            <h1 class="text-lg font-bold">Supplier registration verification</h1>
            <span class="badge badge-neutral badge-sm">{{ store.pagination?.total ?? 0 }}</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <span v-for="lane in lanes" :key="lane.key" :class="['badge badge-sm gap-1 border-0', lane.badgeClass]">
              <span :class="['h-1.5 w-1.5 rounded-full', lane.dotClass]" />{{ lane.shortLabel }} {{ lane.items.length }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
            <label class="input input-sm border-base-300 bg-base-100">
              <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
              <input v-model.trim="search" type="search" class="w-52 placeholder:text-base-content/35" placeholder="Search supplier or invoice" />
            </label>
            <select v-model="year" class="select select-sm border-base-300 bg-base-100" @change="loadPage(1)">
              <option v-for="option in yearOptions" :key="option" :value="option">{{ option }}</option>
            </select>
            <button class="btn btn-outline btn-sm border-base-300" :disabled="store.loading" @click="loadPage(currentPage)">
              <span v-if="store.loading" class="loading loading-spinner loading-xs" />
              <Icon v-else name="lucide:refresh-cw" class="h-4 w-4" />
              Refresh
            </button>
          </div>
      </div>
    </header>

    <div v-if="store.loading" class="grid min-h-96 place-items-center rounded-2xl border border-base-200 bg-base-100">
      <div class="text-center"><span class="loading loading-spinner loading-lg text-emerald-600" /><p class="mt-3 text-sm text-base-content/50">Loading verification board…</p></div>
    </div>

    <div v-else class="grid items-start gap-3 lg:grid-cols-3">
      <article v-for="lane in lanes" :key="lane.key" class="overflow-hidden rounded-xl border border-base-300 bg-base-200/45">
        <header :class="['border-b px-3 py-2.5', lane.headerClass]">
          <div class="flex items-center justify-between gap-3">
            <div class="flex min-w-0 items-center gap-2">
              <span :class="['flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', lane.iconClass]"><Icon :name="lane.icon" class="h-4 w-4" /></span>
              <div class="min-w-0"><h2 class="truncate text-sm font-bold">{{ lane.label }}</h2><p class="truncate text-[0.68rem] opacity-60">{{ lane.description }}</p></div>
            </div>
            <span :class="['badge badge-sm border-0 font-bold', lane.badgeClass]">{{ lane.items.length }}</span>
          </div>
        </header>

        <div class="max-h-[calc(100vh-15rem)] min-h-48 space-y-2 overflow-y-auto p-2">
          <div v-if="lane.items.length === 0" class="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-base-300 bg-base-100/70 p-4 text-center">
            <Icon :name="lane.emptyIcon" class="h-7 w-7 text-base-content/25" />
            <p class="mt-2 text-sm font-semibold text-base-content/55">{{ search ? 'No matching applications' : lane.emptyText }}</p>
          </div>

          <article v-for="item in lane.items" :key="item.id" class="group rounded-lg border border-base-300 bg-base-100 p-3 shadow-sm transition hover:border-primary/35 hover:shadow-md">
            <div class="flex items-start gap-2.5">
              <span :class="['flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold', lane.avatarClass]">{{ initials(item.company_name) }}</span>
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-sm font-bold" :title="item.company_name">{{ item.company_name ?? 'Unnamed supplier' }}</h3>
                <p class="truncate text-[0.68rem] text-base-content/45">{{ item.reg_number ?? 'No registration number' }} · {{ item.supplier_group ?? 'Unclassified' }}</p>
              </div>
              <span :class="['badge badge-xs shrink-0 gap-1 border-0', decayBadgeClass(item)]" :title="statusEnteredTitle(item)"><Icon name="lucide:timer" class="h-3 w-3" />{{ statusAge(item) }}</span>
            </div>

            <div v-if="reviewSignal(item)" class="mt-2 flex items-center gap-1.5 rounded-md bg-error/10 px-2 py-1.5 text-[0.68rem] font-medium text-error" :title="reviewSignal(item)">
              <Icon name="lucide:triangle-alert" class="h-3.5 w-3.5 shrink-0" /><span class="truncate">{{ reviewSignal(item) }}</span>
            </div>

            <div class="mt-2 flex items-center gap-3 text-[0.68rem] text-base-content/55">
              <span class="flex items-center gap-1" :title="item.invoice_number ?? 'No invoice number'"><Icon name="lucide:tags" class="h-3.5 w-3.5" />{{ item.category_count ?? 0 }} categories</span>
              <span class="flex items-center gap-1"><Icon name="lucide:circle-dollar-sign" class="h-3.5 w-3.5 text-success" />{{ paymentAge(item) }}</span>
            </div>

            <div class="mt-2.5 flex items-center justify-between gap-2 border-t border-base-200 pt-2.5">
              <div v-if="item.assignment?.assigned_user" class="flex min-w-0 items-center gap-1.5" :title="`Assigned to ${fullName(item.assignment.assigned_user)}`">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[0.55rem] font-bold text-violet-700">{{ initials(fullName(item.assignment.assigned_user)) }}</span>
                <span class="truncate text-[0.68rem] font-semibold">{{ fullName(item.assignment.assigned_user) }}</span>
              </div>
              <span v-else class="flex items-center gap-1 text-[0.68rem] font-semibold text-warning"><Icon name="lucide:user-round-x" class="h-3.5 w-3.5" />Unassigned</span>

              <div class="flex shrink-0 items-center gap-1">
                <RegistrationsSuppliersAssign v-if="canAssign" compact :company="item" :year="year" />
                <RegistrationsSuppliersShow v-if="canProcess" compact :item="item" :auto-open="isLinkedTask(item)" />
              </div>
            </div>
          </article>
        </div>
      </article>
    </div>

    <footer v-if="store.pagination" class="flex flex-col gap-2 rounded-xl border border-base-200 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-sm text-base-content/55">Page {{ currentPage }} of {{ store.pagination.last_page }} · {{ store.pagination.total }} eligible companies</p>
      <div class="join">
        <button class="btn join-item btn-sm" :disabled="currentPage <= 1 || store.loading" @click="loadPage(currentPage - 1)"><Icon name="lucide:chevron-left" /> Previous</button>
        <button class="btn join-item btn-sm btn-disabled">{{ currentPage }}</button>
        <button class="btn join-item btn-sm" :disabled="currentPage >= store.pagination.last_page || store.loading" @click="loadPage(currentPage + 1)">Next <Icon name="lucide:chevron-right" /></button>
      </div>
    </footer>
  </section>
</template>

<script setup>
const props = defineProps({
  canProcess: { type: Boolean, default: false },
  canAssign: { type: Boolean, default: false },
})

const store = useRegistrationStore()
const route = useRoute()
const currentYear = new Date().getFullYear()
const requestedYear = Number(route.query.year)
const year = ref(Number.isInteger(requestedYear) && requestedYear >= 2000 ? requestedYear : currentYear)
const search = ref('')
const clock = ref(Date.now())
const yearOptions = Array.from({ length: 6 }, (_, index) => currentYear - index)
const currentPage = computed(() => store.pagination?.current_page ?? 1)
let clockTimer = null

const filteredItems = computed(() => {
  const needle = search.value.toLowerCase()
  if (!needle) return store.items
  return store.items.filter(item => [item.company_name, item.reg_number, item.invoice_number, item.supplier_group]
    .some(value => String(value ?? '').toLowerCase().includes(needle)))
})

const laneDefinitions = [
  {
    key: 'NOT_STARTED', label: 'Not automatically verified', shortLabel: 'Not verified', description: 'Waiting for automatic verification',
    icon: 'lucide:circle-dashed', emptyIcon: 'lucide:circle-check-big', emptyText: 'No applications waiting to start',
    dotClass: 'bg-slate-400', headerClass: 'border-slate-200 bg-slate-100', iconClass: 'bg-slate-200 text-slate-700', badgeClass: 'bg-slate-300 text-slate-800', avatarClass: 'bg-slate-100 text-slate-700', statusPanelClass: 'border-slate-200 bg-slate-50 text-slate-700', statusIcon: 'lucide:hourglass',
  },
  {
    key: 'IN_PROGRESS', label: 'Verification in progress', shortLabel: 'In progress', description: 'Being checked automatically',
    icon: 'lucide:scan-search', emptyIcon: 'lucide:radar', emptyText: 'No automatic checks running',
    dotClass: 'bg-blue-400 animate-pulse', headerClass: 'border-blue-200 bg-blue-50', iconClass: 'bg-blue-100 text-blue-700', badgeClass: 'bg-blue-200 text-blue-800', avatarClass: 'bg-blue-100 text-blue-700', statusPanelClass: 'border-blue-200 bg-blue-50 text-blue-800', statusIcon: 'lucide:loader-circle',
  },
  {
    key: 'MANUAL_REVIEW', label: 'Manual verification required', shortLabel: 'Manual review', description: 'Automatic verification could not conclude',
    icon: 'lucide:user-round-search', emptyIcon: 'lucide:shield-check', emptyText: 'No applications need manual review',
    dotClass: 'bg-amber-400', headerClass: 'border-amber-200 bg-amber-50', iconClass: 'bg-amber-100 text-amber-800', badgeClass: 'bg-amber-200 text-amber-900', avatarClass: 'bg-amber-100 text-amber-800', statusPanelClass: 'border-amber-200 bg-amber-50 text-amber-900', statusIcon: 'lucide:triangle-alert',
  },
]

const lanes = computed(() => laneDefinitions.map(lane => ({
  ...lane,
  items: filteredItems.value.filter(item => (item.verification_stage ?? 'NOT_STARTED') === lane.key),
})))

function loadPage(page = 1) {
  return store.fetchAll({ year: year.value, page, company: route.query.company || undefined })
}

function isLinkedTask(item) {
  return Number(route.query.company) === Number(item.company_id)
}

function initials(name) {
  return String(name || 'S').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function fullName(user) {
  return [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || 'Unknown user'
}

function reviewSignal(item) {
  if (item.latest_review_run?.status === 'FAILED') return item.latest_review_run.error || 'Automatic verification failed'
  if (item.latest_review_run?.decision === 'DEFERRED') return 'Automatic verification was inconclusive'
  return ''
}

function statusAgeSeconds(item) {
  if (item.status_entered_at) {
    return Math.max(0, Math.floor((clock.value - new Date(item.status_entered_at).getTime()) / 1000))
  }
  return Math.max(0, Number(item.status_age_seconds || 0))
}

function statusAge(item) {
  const seconds = statusAgeSeconds(item)
  if (seconds < 60) return '<1m'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`
}

function decayBadgeClass(item) {
  const hours = statusAgeSeconds(item) / 3600
  if (hours >= 72) return 'bg-red-200 text-red-900'
  if (hours >= 24) return 'bg-amber-200 text-amber-900'
  if (hours >= 4) return 'bg-yellow-100 text-yellow-900'
  return 'bg-emerald-200 text-emerald-900'
}

function statusEnteredTitle(item) {
  if (!item.status_entered_at) return 'Status transition time unavailable'
  return `In this status since ${new Date(item.status_entered_at).toLocaleString('en-ZW')}`
}

function paymentAge(item) {
  if (item.days_since_payment === null || item.days_since_payment === undefined) return 'Payment date unavailable'
  if (Number(item.days_since_payment) === 0) return 'Paid today'
  return `Paid ${item.days_since_payment}d ago`
}

onMounted(() => {
  clockTimer = setInterval(() => { clock.value = Date.now() }, 60000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>
