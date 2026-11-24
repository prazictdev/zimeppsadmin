<template>
  <section class="space-y-4">
    <nav class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/50" aria-label="Breadcrumb">
      <NuxtLink to="/" class="hover:text-base-content">Home</NuxtLink>
      <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      <NuxtLink to="/admin-plan-dashboard" class="hover:text-base-content">Annual Procurement Plans</NuxtLink>
      <Icon name="lucide:chevron-right" class="h-3.5 w-3.5" />
      <span class="max-w-64 truncate font-medium text-base-content/75">
        {{ store.plan ? `${store.plan.year} · ${store.plan.company?.name || 'Plan detail'}` : 'Plan detail' }}
      </span>
    </nav>

    <div v-if="store.loading && !store.plan" class="space-y-4">
      <div class="skeleton h-20 w-full rounded-xl" />
      <div class="skeleton h-36 w-full rounded-xl" />
      <div class="skeleton h-[32rem] w-full rounded-xl" />
    </div>

    <template v-else-if="store.plan">
      <AdminPlanDetailHeader />

      <section class="rounded-xl border border-base-300 bg-base-100 p-4" aria-labelledby="plan-review-heading">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <h2 id="plan-review-heading" class="font-bold">Plan review</h2>
            <span class="badge badge-sm badge-ghost">{{ tabDefinitions.length }} sections</span>
          </div>
          <p class="text-xs text-base-content/50">Review the same plan record submitted by the procurement entity.</p>
        </div>

        <nav class="mt-3 flex flex-wrap gap-2 border-t border-base-200 pt-3" aria-label="Plan sections">
          <button
            v-for="tab in visibleTabs"
            :key="tab.key"
            type="button"
            :class="[
              'btn btn-sm h-auto min-h-9 gap-1.5 border-base-300 px-3 font-medium',
              activeTab === tab.key ? 'btn-success text-success-content' : 'bg-base-100 text-base-content/75 hover:border-success/40 hover:bg-success/5',
            ]"
            :aria-current="activeTab === tab.key ? 'page' : undefined"
            @click="selectTab(tab.key)"
          >
            <Icon :name="tab.icon" class="h-3.5 w-3.5" />
            {{ tab.label }}
            <span v-if="tabCount(tab.key) !== null" :class="['badge badge-xs', activeTab === tab.key ? 'border-success-content/25 bg-success-content/15 text-success-content' : 'badge-ghost']">
              {{ tabCount(tab.key) }}
            </span>
            <span v-if="tab.key === 'invoice' && store.invoice" :class="['h-2 w-2 rounded-full', store.invoice.status === 'PAID' ? 'bg-success' : 'bg-warning']" />
          </button>
        </nav>
      </section>

      <main class="min-w-0">
        <AdminPlanDetailItems v-if="activeTab === 'items'" :plan-uuid="planUuid" mode="all" />
        <AdminPlanDetailItems v-else-if="activeTab === 'exempted'" :plan-uuid="planUuid" mode="exempted" />
        <AdminPlanDetailDisposalPlans v-else-if="activeTab === 'disposal'" :plan-uuid="planUuid" />
        <AdminPlanDetailEvaluationCommittee v-else-if="activeTab === 'evaluation'" :plan-uuid="planUuid" />
        <AdminPlanDetailProcurementManagementUnit v-else-if="activeTab === 'pmu'" :plan-uuid="planUuid" />
        <AdminPlanDetailDisposalCommittee v-else-if="activeTab === 'disposalcommittee'" :plan-uuid="planUuid" />
        <AdminPlanDetailDocuments v-else-if="activeTab === 'documents'" :plan-uuid="planUuid" />
        <AdminPlanDetailSupplements v-else-if="activeTab === 'supplements'" :plan-uuid="planUuid" />
        <AdminPlanDetailRecommendations v-else-if="activeTab === 'recommendations'" />
        <AdminPlanDetailInvoice v-else-if="activeTab === 'invoice' && store.invoice" />
        <AdminPlanDetailHistory v-else-if="activeTab === 'history'" />
      </main>
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
const router = useRouter()
const planUuid = computed(() => String(route.params.uuid))
const store = useAdminPlanStore()

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
  { key: 'items', label: 'Plan Items', icon: 'lucide:list-checks' },
  { key: 'exempted', label: 'Exemptions', icon: 'lucide:shield-check' },
  { key: 'disposal', label: 'Disposal Plan', icon: 'lucide:trash-2' },
  { key: 'evaluation', label: 'Evaluation Committee', icon: 'lucide:users' },
  { key: 'pmu', label: 'PMU', icon: 'lucide:building-2' },
  { key: 'disposalcommittee', label: 'Disposal Committee', icon: 'lucide:user-round-cog' },
  { key: 'documents', label: 'Required Attachments', icon: 'lucide:paperclip' },
  { key: 'supplements', label: 'Supplements', icon: 'lucide:plus-square' },
  { key: 'recommendations', label: 'Recommendations', icon: 'lucide:message-square-quote' },
  { key: 'invoice', label: 'Plan Invoice', icon: 'lucide:receipt' },
  { key: 'history', label: 'Workflow History', icon: 'lucide:history' },
]

const visibleTabs = computed(() => tabDefinitions.filter(tab => tab.key !== 'invoice' || store.invoice))
const availableTabs = new Set(tabDefinitions.map(tab => tab.key))
const requestedTab = String(route.query.tab || '')
const activeTab = ref(availableTabs.has(requestedTab) ? requestedTab : 'items')

watch(() => route.query.tab, (tab) => {
  const nextTab = String(tab || '')
  activeTab.value = availableTabs.has(nextTab) ? nextTab : 'items'
})

function selectTab(key) {
  activeTab.value = key
  router.replace({ query: { ...route.query, tab: key === 'items' ? undefined : key } })
}

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
