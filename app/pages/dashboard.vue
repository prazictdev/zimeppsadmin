<template>
  <div class="space-y-5">
    <section v-if="visibleTabs.length > 0" class="flex flex-col gap-3 border-b border-base-300 pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div role="tablist" class="tabs tabs-border">
        <button v-for="tab in visibleTabs" :key="tab.key" role="tab" class="tab px-1 sm:px-4" :class="{ 'tab-active': activeTab === tab.key }" @click="activeTab = tab.key">
          <Icon :name="tab.icon" class="mr-1.5 h-4 w-4" />{{ tab.label }}
        </button>
      </div>
      <div v-if="activeTab === 'regulator'" class="flex items-center gap-2 self-end sm:self-auto">
        <label for="dashboard-year" class="text-sm font-medium text-base-content/60">Reporting year</label>
        <select id="dashboard-year" v-model.number="dashboardYear" class="select select-sm w-24" @change="refreshRegulatorDashboard">
          <option v-for="year in dashboardYears" :key="year" :value="year">{{ year }}</option>
        </select>
        <button class="btn btn-sm" :disabled="dashboardLoading" @click="refreshRegulatorDashboard">
          <span v-if="dashboardLoading" class="loading loading-spinner loading-xs" />
          <Icon v-else name="lucide:refresh-cw" class="h-4 w-4" />Refresh
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

const accountTypes = computed(() => user.value?.data?.account_types ?? [])
const accountTypeNames = computed(() => accountTypes.value.map(at => at.name.toLowerCase()))

const currentYear = new Date().getFullYear()
const dashboardYear = ref(currentYear)
const dashboardYears = Array.from({ length: 5 }, (_, index) => currentYear - index)
const dashboardRefreshKey = ref(0)
const dashboardLoading = ref(false)

const refreshRegulatorDashboard = () => {
  dashboardRefreshKey.value += 1
}

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
