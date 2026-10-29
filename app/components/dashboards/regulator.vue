<template>
  <section class="space-y-6">
    <div v-if="loadError" role="alert" class="alert alert-warning border-warning/30 bg-warning/10 text-sm">
      <Icon name="lucide:triangle-alert" class="h-4 w-4" />
      <span>The operational dashboard could not be fully loaded. Try refreshing the page.</span>
    </div>

    <div v-if="loading && !hasLoaded" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="index in 8" :key="index" class="skeleton h-28 rounded-xl" />
    </div>

    <template v-else>
      <section aria-labelledby="regulator-overview-heading">
        <div class="mb-3 flex items-end justify-between">
          <div><p class="text-sm font-medium text-primary">Authority overview</p><h2 id="regulator-overview-heading" class="mt-1 text-lg font-bold">Current operational position</h2></div>
          <span class="text-xs text-base-content/45">Selected reporting year</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <NuxtLink v-for="item in overviewCards" :key="item.label" :to="item.to" class="card card-border bg-base-100">
            <div class="card-body gap-3 p-4">
              <div class="flex items-start justify-between gap-3">
                <div><p class="text-2xl font-bold tabular-nums">{{ item.value }}</p><p class="mt-1 text-sm text-base-content/60">{{ item.label }}</p></div>
                <span class="flex h-9 w-9 items-center justify-center rounded-field bg-base-200 text-primary"><Icon :name="item.icon" class="h-4 w-4" /></span>
              </div>
              <div class="flex items-center justify-between border-t border-base-300 pt-3 text-xs font-semibold text-primary"><span>{{ item.action }}</span><Icon name="lucide:chevron-right" class="h-3.5 w-3.5" /></div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <DashboardSection
        title="Registrations Statistics"
        description="Registration volumes and how completed applications were verified."
        icon="lucide:user-round-check"
        link="/registrations/suppliers"
        link-label="Open registration queue"
      >
        <div class="grid gap-4 lg:grid-cols-[minmax(17rem,0.38fr)_minmax(0,1fr)]">
          <div class="stats stats-vertical h-full w-full border border-base-300 bg-base-100">
            <div class="stat">
              <div class="stat-figure text-primary"><Icon name="lucide:files" class="h-5 w-5" /></div>
              <div class="stat-title">Total registrations</div>
              <div class="stat-value flex items-baseline gap-2 text-2xl">
                <span>{{ integer(registrations.total) }}</span>
                <span class="text-sm font-semibold text-base-content/50">{{ registrationPercentage(registrations.total) }}</span>
              </div>
              <div class="stat-desc">Received in {{ selectedYear }}</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-success"><Icon name="lucide:badge-check" class="h-5 w-5" /></div>
              <div class="stat-title">Automatically verified</div>
              <div class="stat-value flex items-baseline gap-2 text-2xl text-success">
                <span>{{ integer(registrations.automatically_verified) }}</span>
                <span class="text-sm font-semibold">{{ registrationPercentage(registrations.automatically_verified) }}</span>
              </div>
              <div class="stat-desc">Companies and Deeds checks</div>
            </div>
            <div class="stat">
              <div class="stat-figure text-warning"><Icon name="lucide:user-check" class="h-5 w-5" /></div>
              <div class="stat-title">Manually verified</div>
              <div class="stat-value flex items-baseline gap-2 text-2xl text-warning">
                <span>{{ integer(registrations.manually_verified) }}</span>
                <span class="text-sm font-semibold">{{ registrationPercentage(registrations.manually_verified) }}</span>
              </div>
              <div class="stat-desc">Completed through officer review</div>
            </div>
          </div>

          <ChartCard title="Verification method" subtitle="Completed registrations by verification route">
            <div class="h-64"><Bar :data="registrationChart" :options="registrationBarOptions" /></div>
          </ChartCard>
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Annual procurement plans"
        title="APP action queue"
        description="Plans currently waiting for assignment or a regulatory workflow decision."
        icon="lucide:clipboard-list"
        link="/admin-plan-dashboard"
        link-label="Open APP workspace"
      >
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ActionCard label="Not assigned to handler" :value="integer(appQueue.unassigned_handler)" note="Needs ownership" icon="lucide:user-round-plus" tone="error" />
          <ActionCard label="Being worked by handler" :value="integer(appQueue.handler)" note="Initial authority review" icon="lucide:briefcase-business" tone="info" />
          <ActionCard label="Under manager review" :value="integer(appQueue.manager)" note="Recommendation review" icon="lucide:clipboard-check" tone="warning" />
          <ActionCard label="Under approver review" :value="integer(appQueue.approver)" note="Final authority decision" icon="lucide:stamp" tone="success" />
          <ActionCard label="Approved APPs" :value="integer(appQueue.approved)" note="Authorized or active plans" icon="lucide:circle-check-big" tone="success" />
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Finance"
        title="Payment and verification channels"
        description="Verified payment totals split by online settlement and bank verification route."
        icon="lucide:landmark"
        link="/popverifications"
        link-label="Open verification queue"
      >
        <div class="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div class="grid gap-3 sm:grid-cols-3">
            <StatCard label="Online channels" :value="amount(finance.online.total_amount)" :note="`${integer(finance.online.transaction_count)} verified transactions`" icon="lucide:credit-card" />
            <StatCard label="Automatic bank verification" :value="amount(finance.automatic_bank.total_amount)" :note="`${integer(finance.automatic_bank.transaction_count)} CRM-matched transactions`" icon="lucide:bot" tone="success" />
            <StatCard label="Manual bank verification" :value="amount(finance.manual_bank.total_amount)" :note="`${integer(finance.manual_bank.transaction_count)} officer-verified transactions`" icon="lucide:user-round-check" tone="warning" />
          </div>
          <ChartCard title="Channel comparison" subtitle="Verified transaction value">
            <div class="h-56"><Doughnut :data="financeChart" :options="doughnutOptions" /></div>
          </ChartCard>
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Tenders"
        title="Tender portfolio"
        description="Count and recorded tender value by method, procurement category, and SPOC route."
        icon="lucide:gavel"
      >
        <div class="grid gap-4 xl:grid-cols-2">
          <ChartCard title="By procurement method" subtitle="Count and value">
            <div class="h-72"><Bar :data="methodChart" :options="dualAxisOptions" /></div>
          </ChartCard>
          <ChartCard title="By procurement category" subtitle="Procurement group count and value">
            <div class="h-72"><Bar :data="categoryChart" :options="dualAxisOptions" /></div>
          </ChartCard>
          <ChartCard title="SPOC value comparison" subtitle="Actual SPOC submissions versus other tenders">
            <div class="h-64"><Doughnut :data="spocChart" :options="doughnutOptions" /></div>
          </ChartCard>
          <div class="grid gap-3 sm:grid-cols-2">
            <ActionCard label="Came for SPOC" :value="integer(spoc.spoc.tender_count)" :note="`${amount(spoc.spoc.tender_value)} recorded value`" icon="lucide:scale" tone="warning" />
            <ActionCard label="Did not come for SPOC" :value="integer(spoc.non_spoc.tender_count)" :note="`${amount(spoc.non_spoc.tender_value)} recorded value`" icon="lucide:circle-check" tone="success" />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        eyebrow="Customers"
        title="Customer account types"
        description="Distinct companies registered as bidders compared with procurement entities."
        icon="lucide:building-2"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <ActionCard label="Bidder accounts" :value="integer(accountTypes.bidders)" note="Companies with bidder account type" icon="lucide:store" />
          <ActionCard label="Procurement entities" :value="integer(accountTypes.procurement_entities)" note="Companies with procurement entity account type" icon="lucide:building-2" tone="info" />
        </div>
      </DashboardSection>
    </template>
  </section>
</template>

<script setup>
import { Bar, Doughnut } from 'vue-chartjs'
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip)

const props = defineProps({
  selectedYear: { type: Number, default: () => new Date().getFullYear() },
  refreshKey: { type: Number, default: 0 },
})
const emit = defineEmits(['loading-change'])
const registrationHelper = useRegistrationHelper()
const loading = ref(false)
const hasLoaded = ref(false)
const loadError = ref(false)
const analytics = ref({})

const registrations = computed(() => analytics.value.supplier_registration_summary ?? {})
const appQueue = computed(() => analytics.value.app_action_queue ?? {})
const finance = computed(() => analytics.value.finance_summary ?? { online: {}, automatic_bank: {}, manual_bank: {} })
const methods = computed(() => analytics.value.tenders_by_procurement_method ?? [])
const categories = computed(() => analytics.value.tenders_by_category ?? [])
const spoc = computed(() => analytics.value.tender_spoc_comparison ?? { spoc: {}, non_spoc: {} })
const accountTypes = computed(() => analytics.value.customer_account_types ?? {})
const overviewCards = computed(() => [
  { label: 'Supplier registrations', value: integer(registrations.value.total), icon: 'lucide:files', action: 'Open registrations', to: '/registrations/suppliers' },
  { label: 'APPs requiring action', value: integer((appQueue.value.unassigned_handler || 0) + (appQueue.value.handler || 0) + (appQueue.value.manager || 0) + (appQueue.value.approver || 0)), icon: 'lucide:clipboard-clock', action: 'Open APP workspace', to: '/admin-plan-dashboard' },
  { label: 'Verified payments', value: integer((finance.value.online?.transaction_count || 0) + (finance.value.automatic_bank?.transaction_count || 0) + (finance.value.manual_bank?.transaction_count || 0)), icon: 'lucide:badge-dollar-sign', action: 'Open verification', to: '/popverifications' },
  { label: 'Registered organisations', value: integer((accountTypes.value.bidders || 0) + (accountTypes.value.procurement_entities || 0)), icon: 'lucide:building-2', action: 'Review accounts', to: '/companies' },
])

const palette = ['#2563eb', '#16a34a', '#d97706', '#64748b']
const registrationCounts = computed(() => [
  Number(registrations.value.automatically_verified || 0),
  Number(registrations.value.manually_verified || 0),
])
const registrationTotal = computed(() => Number(registrations.value.total || 0))
const registrationPercentages = computed(() => registrationCounts.value.map(value => (
  registrationTotal.value > 0 ? (value / registrationTotal.value) * 100 : 0
)))
const registrationChart = computed(() => ({
  labels: ['Automatically verified', 'Manually verified'],
  datasets: [{
    label: 'Registrations',
    data: registrationCounts.value,
    backgroundColor: [palette[1], palette[2]],
    borderRadius: 6,
    borderSkipped: false,
    barThickness: 30,
  }],
}))
const financeChart = computed(() => ({
  labels: ['Online', 'Automatic bank', 'Manual bank'],
  datasets: [{ data: [finance.value.online?.total_amount || 0, finance.value.automatic_bank?.total_amount || 0, finance.value.manual_bank?.total_amount || 0], backgroundColor: [palette[0], palette[1], palette[2]], borderWidth: 0 }],
}))
const spocChart = computed(() => ({
  labels: ['Came for SPOC', 'Did not come for SPOC'],
  datasets: [{ data: [spoc.value.spoc?.tender_value || 0, spoc.value.non_spoc?.tender_value || 0], backgroundColor: [palette[2], palette[3]], borderWidth: 0 }],
}))

function portfolioChart(rows) {
  return {
    labels: rows.map(row => row.name),
    datasets: [
      { label: 'Tender count', data: rows.map(row => Number(row.tender_count || 0)), backgroundColor: palette[0], borderRadius: 4, yAxisID: 'count' },
      { label: 'Tender value', data: rows.map(row => Number(row.tender_value || 0)), backgroundColor: '#cbd5e1', borderRadius: 4, yAxisID: 'value' },
    ],
  }
}

const methodChart = computed(() => portfolioChart(methods.value))
const categoryChart = computed(() => portfolioChart(categories.value))
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } } },
}
const registrationBarOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: context => `${integer(context.raw)} registrations (${percentage(registrationPercentages.value[context.dataIndex])})`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.18)' },
      ticks: { precision: 0 },
      title: { display: true, text: 'Number of registrations' },
    },
    y: { grid: { display: false } },
  },
}
const dualAxisOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } },
  scales: {
    x: { grid: { display: false } },
    count: { beginAtZero: true, position: 'left', ticks: { precision: 0 }, title: { display: true, text: 'Count' } },
    value: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: value => compact(value) }, title: { display: true, text: 'Value' } },
  },
}

const integer = value => new Intl.NumberFormat('en-ZW', { maximumFractionDigits: 0 }).format(Number(value || 0))
const amount = value => new Intl.NumberFormat('en-ZW', { maximumFractionDigits: 2 }).format(Number(value || 0))
const compact = value => new Intl.NumberFormat('en-ZW', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0))
const percentage = value => `${new Intl.NumberFormat('en-ZW', { maximumFractionDigits: 1 }).format(Number(value || 0))}%`
const registrationPercentage = value => percentage(registrationTotal.value > 0 ? (Number(value || 0) / registrationTotal.value) * 100 : 0)

async function loadDashboard() {
  loading.value = true
  loadError.value = false
  emit('loading-change', true)
  const result = await registrationHelper.getRegistrationAnalytics(Number(props.selectedYear))
  if (result.ok) analytics.value = result.data?.data ?? {}
  else loadError.value = true
  hasLoaded.value = true
  loading.value = false
  emit('loading-change', false)
}

watch(() => props.refreshKey, loadDashboard)
onMounted(loadDashboard)
</script>
