<template>
  <div class="space-y-5">
    <section v-if="visibleTabs.length > 0" class="relative overflow-hidden rounded-box bg-neutral text-neutral-content">
      <div class="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
      <div class="flex flex-col gap-5 px-5 pt-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-medium text-neutral-content/60">{{ currentDate }}</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight">Good {{ greeting }}, {{ firstName }}</h1>
          <p class="mt-1 text-sm text-neutral-content/65">National procurement oversight and regulatory operations</p>
          <div v-if="accountTypeNames.length" class="mt-3 flex flex-wrap gap-1.5">
            <span v-for="at in accountTypes" :key="at.id" class="badge badge-sm border-neutral-content/15 bg-neutral-content/10 text-neutral-content">{{ at.name }}</span>
          </div>
        </div>
        <div v-if="activeTab === 'regulator'" class="flex flex-wrap items-center gap-2">
          <select v-model.number="dashboardYear" class="select select-sm border-neutral-content/15 bg-neutral text-neutral-content" aria-label="Dashboard year" @change="refreshRegulatorDashboard">
            <option v-for="year in dashboardYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <button class="btn btn-sm border-0 bg-neutral-content text-neutral hover:bg-neutral-content/90" :disabled="dashboardLoading" @click="refreshRegulatorDashboard">
            <span v-if="dashboardLoading" class="loading loading-spinner loading-xs" />
            <Icon v-else name="lucide:refresh-cw" class="h-4 w-4" />Refresh
          </button>
        </div>
      </div>
      <div role="tablist" class="tabs tabs-border mt-5 px-5 sm:px-7">
        <button v-for="tab in visibleTabs" :key="tab.key" role="tab" class="tab h-12 text-neutral-content/60 [--tab-border-color:var(--color-accent)]" :class="{ 'tab-active text-neutral-content': activeTab === tab.key }" @click="activeTab = tab.key">
          <Icon :name="tab.icon" class="mr-1.5 h-4 w-4" />{{ tab.label }}
        </button>
      </div>
    </section>

    <div v-if="visibleTabs.length > 0" role="tabpanel">
      <component
        :is="visibleTabs.find(tab => tab.key === activeTab)?.component"
        :selected-year="activeTab === 'regulator' ? dashboardYear : undefined"
        :refresh-key="activeTab === 'regulator' ? dashboardRefreshKey : undefined"
        @loading-change="dashboardLoading = $event"
      />
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
