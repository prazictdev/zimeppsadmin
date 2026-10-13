<template>
  <section class="space-y-4">
    <nav class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/50" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-base-content">Home</NuxtLink>
      <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      <NuxtLink to="/admin-plan-dashboard" class="hover:text-base-content">Plan workflow</NuxtLink>
      <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      <span class="max-w-64 truncate font-medium text-base-content/75">{{ store.plan?.company?.name || 'Plan detail' }}</span>
    </nav>

    <div v-if="store.loading && !store.plan" class="space-y-4">
      <div class="skeleton h-52 w-full rounded-xl" />
      <div class="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]"><div class="skeleton h-96 rounded-xl" /><div class="skeleton h-[32rem] rounded-xl" /></div>
    </div>

    <template v-else-if="store.plan">
      <AdminPlanDetailHeader />

      <div class="grid items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside class="rounded-xl border border-base-300 bg-base-100 lg:sticky lg:top-4">
          <header class="border-b border-base-200 px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Review workspace</p>
            <p class="mt-0.5 text-sm font-semibold">Plan sections</p>
          </header>

          <nav class="space-y-4 p-2" aria-label="Plan sections">
            <div v-for="group in navigationGroups" :key="group.label">
              <p class="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-base-content/35">{{ group.label }}</p>
              <div class="space-y-0.5">
                <button
                  v-for="tab in group.tabs"
                  :key="tab.key"
                  type="button"
                  :class="['flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition', activeTab === tab.key ? 'bg-slate-900 font-semibold text-white' : 'text-base-content/65 hover:bg-base-200/60 hover:text-base-content']"
                  @click="activeTab = tab.key"
                >
                  <Icon :name="tab.icon" :class="['h-4 w-4 shrink-0', activeTab === tab.key ? 'text-white/75' : 'text-base-content/40']" />
                  <span class="min-w-0 flex-1 truncate">{{ tab.label }}</span>
                  <span v-if="tabCount(tab.key) !== null" :class="['rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold', activeTab === tab.key ? 'bg-white/15 text-white' : 'bg-base-200 text-base-content/55']">{{ tabCount(tab.key) }}</span>
                  <span v-if="tab.key === 'invoice' && store.invoice" :class="['h-2 w-2 rounded-full', store.invoice.status === 'PAID' ? 'bg-emerald-500' : 'bg-amber-500']" />
                </button>
              </div>
            </div>
          </nav>
        </aside>

        <main class="min-w-0 space-y-3">
          <header class="flex flex-col gap-2 rounded-xl border border-base-300 bg-base-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-3">
              <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-base-200 text-base-content/60"><Icon :name="activeTabDefinition.icon" class="h-4.5 w-4.5" /></span>
              <div><h2 class="font-bold">{{ activeTabDefinition.label }}</h2><p class="text-xs text-base-content/45">{{ activeTabDefinition.description }}</p></div>
            </div>
            <span class="text-xs text-base-content/40">Plan year {{ store.plan.year }}</span>
          </header>

          <template v-if="activeTab === 'items'">
            <AdminPlanDetailReviewAnalysis :plan-uuid="planUuid" @view-section="activeTab = $event" />
          </template>
          <PlanClassificationValidation v-else-if="activeTab === 'classification'" :plan-uuid="planUuid" />
          <AdminPlanDetailItems v-else-if="activeTab === 'consolidated'" :plan-uuid="planUuid" mode="consolidated" />
          <AdminPlanDetailItems v-else-if="activeTab === 'exempted'" :plan-uuid="planUuid" mode="exempted" />
          <AdminPlanDetailDisposalPlans v-else-if="activeTab === 'disposal'" :plan-uuid="planUuid" />
          <AdminPlanDetailEvaluationCommittee v-else-if="activeTab === 'evaluation'" :plan-uuid="planUuid" />
          <AdminPlanDetailProcurementManagementUnit v-else-if="activeTab === 'pmu'" :plan-uuid="planUuid" />
          <AdminPlanDetailDisposalCommittee v-else-if="activeTab === 'disposalcommittee'" :plan-uuid="planUuid" />
          <AdminPlanDetailDocuments v-else-if="activeTab === 'documents'" :plan-uuid="planUuid" />
          <AdminPlanDetailRecommendations v-else-if="activeTab === 'recommendations'" />
          <AdminPlanDetailSupplements v-else-if="activeTab === 'supplements'" :plan-uuid="planUuid" />
          <AdminPlanDetailInvoice v-else-if="activeTab === 'invoice' && store.invoice" />
          <AdminPlanDetailHistory v-else-if="activeTab === 'history'" />
        </main>
      </div>
    </template>

    <div v-else-if="!store.loading" class="rounded-xl border border-warning/30 bg-warning/10 p-6 text-center">
      <Icon name="lucide:file-question" class="mx-auto h-8 w-8 text-warning" />
      <h2 class="mt-2 font-bold">Plan unavailable</h2>
      <p class="mt-1 text-sm text-base-content/55">The requested plan could not be loaded or is no longer available.</p>
      <NuxtLink to="/admin-plan-dashboard" class="btn btn-sm btn-neutral mt-4">Return to plan workflow</NuxtLink>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const route = useRoute()
const planUuid = computed(() => String(route.params.uuid))
const store = useAdminPlanStore()
const availableTabs = new Set(['items', 'classification', 'consolidated', 'exempted', 'disposal', 'supplements', 'evaluation', 'pmu', 'disposalcommittee', 'documents', 'recommendations', 'invoice', 'history'])
const requestedTab = String(route.query.tab || '')
const activeTab = ref(availableTabs.has(requestedTab) ? requestedTab : 'items')

watch(() => route.query.tab, (tab) => {
  const nextTab = String(tab || '')
  if (availableTabs.has(nextTab)) activeTab.value = nextTab
})

const ADMIN_ACTIONS = new Set([
  'handler_recommend',
  'manager_agree',
  'manager_disagree',
  'approver_approve',
  'approver_send_back_to_manager',
  'approver_send_back_to_pe',
])

const adminHistoryCount = computed(() => (store.transitions ?? []).filter(transition => ADMIN_ACTIONS.has(transition.action)).length)

const tabDefinitions = [
  { key: 'items', label: 'Plan analysis', description: 'Class application, procurement method mix and applicant governance risk.', icon: 'lucide:chart-no-axes-combined' },
  { key: 'classification', label: 'Item classification', description: 'Review and confirm each item’s UNSPSC classification before final approval.', icon: 'lucide:scan-search' },
  { key: 'consolidated', label: 'Consolidated items', description: 'Review manually consolidated procurement groups and their line items.', icon: 'lucide:layers' },
  { key: 'exempted', label: 'Exempted items', description: 'Review plan items approved for a procurement exemption.', icon: 'lucide:shield-check' },
  { key: 'disposal', label: 'Disposal plan', description: 'Assets and activities proposed for disposal.', icon: 'lucide:trash-2' },
  { key: 'supplements', label: 'Supplements', description: 'Review amendments submitted against the annual plan.', icon: 'lucide:plus-square' },
  { key: 'evaluation', label: 'Evaluation committee', description: 'Committee composition and member declarations.', icon: 'lucide:users' },
  { key: 'pmu', label: 'Procurement unit', description: 'Procurement Management Unit membership.', icon: 'lucide:building-2' },
  { key: 'disposalcommittee', label: 'Disposal committee', description: 'Committee responsible for disposal proceedings.', icon: 'lucide:user-round-cog' },
  { key: 'documents', label: 'Required documents', description: 'Supporting documents supplied with the plan.', icon: 'lucide:paperclip' },
  { key: 'recommendations', label: 'Recommendations', description: 'Handler, manager and approver recommendation chain.', icon: 'lucide:message-square-quote' },
  { key: 'invoice', label: 'Plan invoice', description: 'Generated regulatory invoice and payment status.', icon: 'lucide:receipt' },
  { key: 'history', label: 'Workflow history', description: 'Audit trail of regulatory decisions and comments.', icon: 'lucide:history' },
]

const navigationGroups = computed(() => [
  { label: 'Plan review', tabs: tabDefinitions.filter(tab => ['items', 'classification', 'consolidated', 'exempted', 'disposal', 'supplements'].includes(tab.key)) },
  { label: 'Governance', tabs: tabDefinitions.filter(tab => ['evaluation', 'pmu', 'disposalcommittee', 'documents'].includes(tab.key)) },
  { label: 'Decision record', tabs: tabDefinitions.filter(tab => ['recommendations', 'history'].includes(tab.key)) },
  { label: 'Finance', tabs: store.invoice ? tabDefinitions.filter(tab => tab.key === 'invoice') : [] },
].filter(group => group.tabs.length))

const activeTabDefinition = computed(() => tabDefinitions.find(tab => tab.key === activeTab.value) ?? tabDefinitions[0])

function tabCount(key) {
  if (key === 'items') return store.plan?.items_count ?? null
  if (key === 'exempted') return store.totalsByFlag?.find(row => row.key === 'procurement_exemption')?.count ?? 0
  if (key === 'recommendations') return store.recommendations?.length ?? 0
  if (key === 'history') return adminHistoryCount.value
  return null
}

useHead({ title: () => `Plan ${store.plan?.year ?? ''} · ${store.plan?.company?.name ?? ''}` })

const { can, guardPage } = useCheckPermission()
onMounted(async () => {
  await guardPage(null, 'You do not have permission to view this plan.')
  if (!can('can.review.plans') && !can('can.view.recommendations') && !can('can.approve.plans')) return
  await store.loadAll(planUuid.value)
})
</script>
