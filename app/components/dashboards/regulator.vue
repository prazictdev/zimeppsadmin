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
      <DashboardSection
        eyebrow="Supplier registrations"
        title="Registration verification"
        description="Registration volumes and the route used to complete verification."
        icon="lucide:user-round-check"
        link="/registrations/suppliers"
        link-label="Open registration queue"
      >
        <div class="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div class="grid gap-3 sm:grid-cols-3">
            <StatCard label="Total registrations" :value="integer(registrations.total)" note="Received in the selected year" icon="lucide:files" />
            <StatCard label="Automatically verified" :value="integer(registrations.automatically_verified)" note="Cleared by Companies and Deeds checks" icon="lucide:badge-check" tone="success" />
            <StatCard label="Manually verified" :value="integer(registrations.manually_verified)" note="Approved through officer review" icon="lucide:user-check" tone="warning" />
          </div>
          <ChartCard title="Automatic vs manual" subtitle="Approved registrations">
            <div class="h-56"><Doughnut :data="registrationChart" :options="doughnutOptions" /></div>
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

const palette = ['#2563eb', '#16a34a', '#d97706', '#64748b']
const registrationChart = computed(() => ({
  labels: ['Automatic', 'Manual'],
  datasets: [{ data: [registrations.value.automatically_verified || 0, registrations.value.manually_verified || 0], backgroundColor: [palette[1], palette[2]], borderWidth: 0 }],
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
