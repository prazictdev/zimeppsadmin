<template>
  <div class="space-y-5">

    <!-- Welcome Banner -->
    <div class="rounded-xl border border-base-300 bg-base-100 p-5">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">Procurement Regulatory Authority of Zimbabwe</p>
          <h1 class="mt-2 text-2xl font-bold">Good {{ greeting }}, {{ firstName }}</h1>
          <p class="mt-1 text-sm text-base-content/55">
            National e-Procurement oversight and regulatory operations
          </p>
          <div v-if="accountTypeNames.length" class="mt-2 flex flex-wrap gap-1">
            <span
              v-for="at in accountTypes"
              :key="at.id"
              class="badge badge-sm badge-ghost"
            >
              {{ at.name }}
            </span>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center justify-end gap-2 sm:mt-0">
          <div v-if="activeTab === 'regulator'" class="flex items-center gap-2">
            <label class="input input-sm w-32 border-base-300 bg-base-100">
              <Icon name="lucide:calendar-days" class="h-4 w-4 text-base-content/45" />
              <select v-model.number="dashboardYear" class="grow bg-transparent text-sm outline-none" @change="refreshRegulatorDashboard">
                <option v-for="year in dashboardYears" :key="year" :value="year">{{ year }}</option>
              </select>
            </label>
            <button class="btn btn-sm btn-neutral" :disabled="dashboardLoading" @click="refreshRegulatorDashboard">
              <span v-if="dashboardLoading" class="loading loading-spinner loading-xs" />
              <Icon v-else name="lucide:refresh-cw" class="h-4 w-4" />
              Refresh
            </button>
          </div>
          <div class="flex items-center gap-3 rounded-lg border border-base-200 bg-base-200/30 px-4 py-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-base-200 text-base-content/55">
              <Icon name="lucide:calendar-clock" class="h-5 w-5" />
            </span>
            <div class="text-sm">
              <p class="text-base-content/45">{{ currentDate }}</p>
              <p class="font-semibold">{{ currentTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Tabs -->
    <div v-if="visibleTabs.length > 0">
      <div role="tablist" class="tabs tabs-border">
        <template v-for="tab in visibleTabs" :key="tab.key">
          <a
            role="tab"
            class="tab"
            :class="{ 'tab-active': activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <Icon :name="tab.icon" class="mr-1.5 h-4 w-4" />
            {{ tab.label }}
          </a>
          <div
            role="tabpanel"
            class="tab-content pt-5"
          >
            <component
              :is="tab.component"
              v-if="activeTab === tab.key"
              :selected-year="tab.key === 'regulator' ? dashboardYear : undefined"
              :refresh-key="tab.key === 'regulator' ? dashboardRefreshKey : undefined"
              @loading-change="dashboardLoading = $event"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- No account type assigned -->
    <div v-else class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body flex flex-col items-center gap-3 py-12 text-center text-base-content/40">
        <Icon name="lucide:layout-dashboard" class="h-10 w-10" />
        <p class="font-semibold">No dashboard available</p>
        <p class="text-sm">Your account has no roles linked to a dashboard type. Contact your administrator.</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import DashboardsRegulator from '~/components/dashboards/regulator.vue'
import DashboardsEntity from '~/components/dashboards/entity.vue'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Dashboard',
})

const { user } = useSanctumAuth()

const userData = computed(() => user.value?.data?.user ?? null)
const accountTypes = computed(() => user.value?.data?.account_types ?? [])
const accountTypeNames = computed(() => accountTypes.value.map(at => at.name.toLowerCase()))

const firstName = computed(() => userData.value?.name || 'Regulator')
const currentYear = new Date().getFullYear()
const dashboardYear = ref(currentYear)
const dashboardYears = Array.from({ length: 5 }, (_, index) => currentYear - index)
const dashboardRefreshKey = ref(0)
const dashboardLoading = ref(false)

const refreshRegulatorDashboard = () => {
  dashboardRefreshKey.value += 1
}

// Clock
const now = ref(new Date())
let clockTimer = null

onMounted(() => {
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

const currentDate = computed(() =>
  now.value.toLocaleDateString('en-ZW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)
const currentTime = computed(() =>
  now.value.toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)
const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
})

const TAB_DEFINITIONS = [
  {
    key: 'regulator',
    label: 'Regulator Dashboard',
    icon: 'lucide:landmark',
    keywords: ['regulator', 'praz', 'authority'],
    component: DashboardsRegulator,
  },
  {
    key: 'entity',
    label: 'Procuring Entity Dashboard',
    icon: 'lucide:building-2',
    keywords: ['entity', 'procur', 'government', 'ministry'],
    component: DashboardsEntity,
  },
]

const visibleTabs = computed(() => {
  if (accountTypeNames.value.length === 0) return []
  return TAB_DEFINITIONS.filter(tab =>
    accountTypeNames.value.some(name =>
      tab.keywords.some(kw => name.includes(kw))
    )
  )
})

const activeTab = ref(null)

watch(visibleTabs, (tabs) => {
  if (tabs.length && !tabs.find(t => t.key === activeTab.value)) {
    activeTab.value = tabs[0].key
  }
}, { immediate: true })
</script>
