<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <p class="text-sm text-base-content/60">Whole-plan analysis · planned line items and governance evidence</p>
      <button class="btn btn-outline btn-sm" :disabled="loading" @click="load"><Icon name="lucide:refresh-cw" /> Refresh analysis</button>
    </div>
    <div v-if="loading" class="rounded-xl border border-base-300 p-12 text-center" role="status"><span class="loading loading-spinner" /><p class="mt-2 text-sm">Analysing plan and committee records…</p></div>
    <div v-else-if="error" class="alert alert-error" role="alert"><Icon name="lucide:triangle-alert" /><span>{{ error }}</span><button class="btn btn-sm" @click="load">Retry</button></div>
    <template v-else-if="report">
      <div class="grid gap-3 md:grid-cols-2">
        <article class="rounded-xl border border-base-300 bg-base-100 p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">Class applied for</p>
          <h3 class="mt-3 text-2xl font-bold">{{ report.class_applied_for || 'Not specified' }}</h3>
          <p class="mt-2 text-xs text-base-content/50">Procurement class recorded on this application</p>
        </article>
        <article class="rounded-xl border border-base-300 bg-base-100 p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">Planned procurement value</p>
          <h3 class="mt-3 text-2xl font-bold tabular-nums">{{ money(report.total_value) }}</h3>
          <p class="mt-2 text-xs text-base-content/50">{{ report.total_items }} line items · {{ report.currency || 'Currency not specified' }}</p>
        </article>
      </div>

      <AdminPlanDetailAwardSpocSummary />

      <section class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <header class="border-b border-base-200 p-4">
          <h3 class="font-bold">Procurement method mix</h3>
          <p class="mt-1 text-xs text-base-content/60">Counts are planned line items, not units purchased or completed purchases. Values use the plan currency.</p>
        </header>
        <div v-if="report.unresolved_items" class="border-b border-warning/20 bg-warning/10 px-4 py-3 text-sm">
          {{ report.unresolved_items }} items have unresolved methods. These remain included in totals. Dominant-method comparisons use resolved methods only.
        </div>
        <p v-if="!report.methods.length" class="p-8 text-center text-base-content/60">No plan items have been recorded.</p>
        <div v-else class="overflow-x-auto">
          <table class="table table-sm">
            <thead><tr><th>Procurement method</th><th class="text-right">Items</th><th class="text-right">Planned value</th><th class="text-right">Share of plan</th></tr></thead>
            <tbody>
              <tr v-for="method in report.methods" :key="method.key">
                <td class="min-w-44"><p class="font-semibold" :class="{ 'text-warning': !method.resolved }">{{ method.label }}</p><span class="text-xs text-base-content/50">{{ method.item_share }}% of line items</span></td>
                <td class="text-right font-semibold">{{ method.count }}</td>
                <td class="text-right font-semibold">{{ money(method.value) }}</td>
                <td class="text-right">{{ method.value_share }}%</td>
              </tr>
            </tbody>
            <tfoot><tr><th>Whole plan</th><td class="text-right">{{ report.total_items }}</td><td class="text-right">{{ money(report.total_value) }}</td><td class="text-right">100%</td></tr></tfoot>
          </table>
        </div>
        <footer v-if="report.dominant_by_items.length" class="border-t border-base-200 px-4 py-3 text-xs text-base-content/60">Most line items: <span class="font-semibold">{{ report.dominant_by_items.map(method => method.label).join(' / ') }}</span> · {{ report.dominant_by_items[0].count }} items each ({{ report.dominant_by_items[0].item_share }}% each).</footer>
      </section>

      <section class="rounded-xl border border-base-300 bg-base-100">
        <header class="flex flex-col gap-4 border-b border-base-200 p-5 sm:flex-row sm:items-center">
          <div class="flex-1"><p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">Applicant governance risk</p><h3 class="mt-1 text-lg font-bold">Committee structure and evidence</h3><p class="mt-2 max-w-2xl text-sm text-base-content/60">Higher scores indicate more structural concerns or missing evidence. This provisional review rubric supports officer assessment; it does not determine legal compliance or approval.</p></div>
          <div class="min-w-32 rounded-xl bg-base-200 p-4 text-center"><p class="text-3xl font-bold tabular-nums">{{ report.governance.score ?? '—' }}<span class="text-sm font-normal text-base-content/50"> / 100</span></p><span class="badge mt-2" :class="riskBadge">{{ report.governance.band }} review risk</span></div>
        </header>
        <div v-if="!report.governance.member_records" class="m-4 rounded-lg bg-warning/10 p-3 text-sm">No committee member records are available. The score reflects missing evidence, not a demonstrated adverse finding.</div>
        <div class="grid gap-3 p-4 xl:grid-cols-3">
          <article v-for="committee in report.governance.committees" :key="committee.key" class="rounded-lg border border-base-300 p-4">
            <h4 class="font-semibold">{{ committee.label }}</h4>
            <p class="mt-2 text-2xl font-bold">{{ committee.count }} <span class="text-xs font-normal text-base-content/60">member records</span></p>
            <p v-if="committee.head_count !== null" class="mt-2 text-xs">PMU heads: <strong>{{ committee.head_count }}</strong></p>
            <div class="mt-3 flex flex-wrap gap-1"><span v-for="role in committee.roles" :key="role.name" class="badge badge-ghost badge-sm h-auto py-1">{{ role.name }} · {{ role.count }}</span><span v-if="!committee.roles.length" class="text-xs text-base-content/50">No roles recorded</span></div>
            <div v-if="committee.with_qualifications !== null" class="mt-3 space-y-1 text-xs text-base-content/60"><p>Qualification records: {{ committee.with_qualifications }} / {{ committee.count }} members</p><p>Work-history records: {{ committee.with_experience }} / {{ committee.count }} members</p></div>
            <p v-else class="mt-3 text-xs text-base-content/60">Qualification and work-history evidence is not collected for disposal members.</p>
            <button class="btn btn-outline btn-sm mt-4 w-full" @click="$emit('view-section', committee.key)">Review composition <Icon name="lucide:arrow-right" /></button>
          </article>
        </div>
        <div class="overflow-x-auto border-t border-base-200">
          <table class="table table-sm">
            <thead><tr><th>Risk factor</th><th>Recorded evidence</th><th class="text-right">Risk points / weight</th></tr></thead>
            <tbody><tr v-for="factor in report.governance.factors" :key="factor.key"><td class="min-w-44 font-semibold">{{ factor.label }}</td><td class="min-w-64 text-xs text-base-content/65">{{ factor.evidence }}</td><td class="whitespace-nowrap text-right font-semibold" :class="factor.points > 0 ? 'text-warning' : 'text-success'">{{ factor.points }} / {{ factor.weight }}</td></tr></tbody>
          </table>
        </div>
        <details v-if="report.governance.overlaps.length" class="border-t border-base-200 p-4"><summary class="cursor-pointer text-sm font-semibold">Inspect shared membership ({{ report.governance.overlaps.length }} matches)</summary><ul class="mt-3 space-y-2 text-sm"><li v-for="(overlap, index) in report.governance.overlaps" :key="index"><strong>{{ overlap.name }}</strong> · {{ overlap.committees.join(' / ') }}</li></ul></details>
        <footer class="space-y-1 border-t border-base-200 p-4 text-xs text-base-content/55"><p>{{ report.governance.version }} · Score = risk points ÷ total weights × 100. Partial evidence gaps contribute proportionally; missing structures contribute their full weight.</p><p>Low: below {{ report.governance.bands.medium_from }} · Medium: {{ report.governance.bands.medium_from }}–{{ report.governance.bands.high_from - 1 }} · High: {{ report.governance.bands.high_from }}–100. Member identity matches use user ID or email; qualifications and work history are recorded evidence, not verified competence.</p></footer>
      </section>
    </template>
    <section class="rounded-xl border border-base-300 bg-base-100 p-4">
      <div class="flex flex-wrap items-center justify-between gap-3"><div><h3 class="font-bold">Item-level review</h3><p class="text-xs text-base-content/55">Inspect consolidated groups and individual plan items.</p></div><button class="btn btn-outline btn-sm" :aria-expanded="showItems" @click="showItems = !showItems">{{ showItems ? 'Hide plan items' : 'Inspect plan items' }} <Icon :name="showItems ? 'lucide:chevron-up' : 'lucide:chevron-down'" /></button></div>
      <AdminPlanDetailItems v-if="showItems" :plan-uuid="planUuid" class="mt-4" />
    </section>
  </div>
</template>

<script setup>
const props = defineProps({ planUuid: { type: String, required: true } })
defineEmits(['view-section'])
const client = useSanctumClient()
const report = ref(null)
const loading = ref(false)
const error = ref('')
const showItems = ref(false)
let requestId = 0

async function load() {
  const current = ++requestId
  loading.value = true
  error.value = ''
  try {
    const response = await client(`/api/v1/annual-procurement-plans/${props.planUuid}/review-analysis`, { method: 'GET' })
    if (current === requestId) report.value = response.data
  } catch {
    if (current === requestId) error.value = 'Unable to load plan analysis. Please retry.'
  } finally {
    if (current === requestId) loading.value = false
  }
}

const riskBadge = computed(() => ({ Low: 'badge-success', Medium: 'badge-warning', High: 'badge-error' })[report.value?.governance.band] || 'badge-ghost')
const money = value => Number(value || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

watch(() => props.planUuid, () => { report.value = null; showItems.value = false; load() }, { immediate: true })
onBeforeUnmount(() => { requestId++ })
</script>
