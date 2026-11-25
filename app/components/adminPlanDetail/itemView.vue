<template>
  <div>
    <button class="btn btn-ghost btn-xs" @click="openModal">
      <Icon name="lucide:eye" />
      <span class="hidden md:block">View</span>
    </button>

    <dialog :id="dialogId" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">
            Plan Item · {{ item.reference_no || `#${item.id}` }}
          </h3>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="mx-auto mt-3 max-w-6xl space-y-2 pb-4">
          <details open class="collapse collapse-arrow border border-base-300 bg-base-100">
            <summary class="collapse-title min-h-0 py-3 font-semibold">Identification</summary>
            <div class="collapse-content px-0 pb-0">
              <div class="overflow-x-auto border-t border-base-200">
                <table class="table table-sm">
                  <tbody>
                    <tr><th class="w-56 text-base-content/60">Reference No.</th><td class="font-mono">{{ item.reference_no || '—' }}</td></tr>
                    <tr><th class="text-base-content/60">Description</th><td class="whitespace-pre-line">{{ item.description || '—' }}</td></tr>
                    <tr><th class="text-base-content/60">Method / group</th><td>{{ methodLabel || '—' }} · {{ item.procurementgroup?.name || '—' }}</td></tr>
                    <tr><th class="text-base-content/60">Funding / unit</th><td>{{ item.sourceoffunds?.name || '—' }} · {{ item.unitofmeasure?.name || '—' }}</td></tr>
                    <tr><th class="text-base-content/60">UNSPSC</th><td>{{ unspscLabel }}</td></tr>
                    <tr><th class="text-base-content/60">Planning</th><td>{{ item.expensecategory || '—' }} · {{ effectiveAwardType === 'FRAMEWORK' ? 'Framework' : 'Award' }} · {{ item.quarter || 'No quarter' }}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </details>

          <details v-if="item.procurement_exemption && item.exemption_grounds?.length" open class="collapse collapse-arrow border border-success/30 bg-success/5">
            <summary class="collapse-title min-h-0 py-3 font-semibold">
              <span class="flex items-center gap-2"><Icon name="lucide:badge-check" class="text-success" />Approved exemption grounds <span class="badge badge-success badge-sm">{{ item.exemption_grounds.length }}</span></span>
            </summary>
            <div class="collapse-content grid gap-2 border-t border-success/20 pt-3 sm:grid-cols-2">
              <article v-for="ground in item.exemption_grounds" :key="ground.ground_uuid || ground.ground_id" class="rounded-box border border-base-300 bg-base-100 p-3">
                <span class="badge badge-outline badge-sm">{{ ground.type?.name || 'Exemption' }}</span>
                <p class="mt-2 text-sm">{{ ground.justification || 'No additional justification recorded.' }}</p>
                <dl v-if="Object.keys(ground.approved_terms || {}).length" class="mt-2 grid grid-cols-2 gap-x-3 text-xs text-base-content/60"><template v-for="(value, key) in ground.approved_terms" :key="key"><dt>{{ readable(key) }}</dt><dd>{{ value ?? '—' }}</dd></template></dl>
              </article>
            </div>
          </details>

          <details class="collapse collapse-arrow border border-base-300 bg-base-100">
            <summary class="collapse-title min-h-0 py-3 font-semibold">
              <span class="flex items-center justify-between gap-3 pr-8"><span>Costing</span><span class="font-mono text-sm">Total {{ formatNum(item.total_cost) }}</span></span>
            </summary>
            <div class="collapse-content grid grid-cols-1 gap-px border-t border-base-200 bg-base-200 pt-0 sm:grid-cols-3">
              <div class="bg-base-100 px-4 py-3"><p class="text-xs text-base-content/55">Quantity</p><p class="mt-1 font-mono font-semibold">{{ formatNum(item.quantity) }}</p></div>
              <div class="bg-base-100 px-4 py-3"><p class="text-xs text-base-content/55">Unit cost</p><p class="mt-1 font-mono font-semibold">{{ formatNum(item.unit_cost) }}</p></div>
              <div class="bg-base-100 px-4 py-3"><p class="text-xs text-base-content/55">Total cost</p><p class="mt-1 font-mono font-semibold">{{ formatNum(item.total_cost) }}</p></div>
            </div>
          </details>

          <details open class="collapse collapse-arrow border border-base-300 bg-base-100">
            <summary class="collapse-title min-h-0 py-3 font-semibold">
              <span class="flex items-center gap-3 pr-8"><span>Statutory procurement schedule</span><span :class="['badge badge-sm', scheduleBadge]">{{ displayedScheduleLabel }}</span></span>
            </summary>
            <div class="collapse-content border-t border-base-200 px-0 pb-0">
              <div v-if="schedule?.status === 'EXEMPTED'" role="alert" class="alert alert-success alert-soft m-3">
                <Icon name="lucide:shield-check" /><span>This item has an approved procurement exemption and is excluded from statutory schedule violation counts.</span>
              </div>
              <div v-else-if="schedule?.status === 'CONFIGURATION_MISSING'" role="alert" class="alert alert-warning alert-soft m-3">
                <Icon name="lucide:triangle-alert" /><span>The legal time-limit configuration for this method and group is incomplete.</span>
              </div>
              <div v-else-if="schedule?.status === 'INCOMPLETE'" role="alert" class="alert alert-warning alert-soft m-3">
                <Icon name="lucide:triangle-alert" /><span>This item has not produced a complete persisted schedule and cannot pass submission checks.</span>
              </div>

              <dl class="grid grid-cols-1 border-t border-base-200 sm:grid-cols-2 lg:grid-cols-3">
                <div v-for="entry in scheduleEntries" :key="entry.label" class="border-b border-base-200 px-4 py-2.5 sm:border-r">
                  <dt class="text-xs text-base-content/55">{{ entry.label }}</dt><dd class="mt-0.5 text-sm font-medium">{{ entry.value }}</dd>
                </div>
              </dl>

              <div v-if="schedule?.status !== 'EXEMPTED' && schedule?.stages?.length" class="overflow-x-auto border-t border-base-200">
                <table class="table table-sm">
                  <thead><tr><th>Legal-period assessment</th><th class="text-right">Required</th><th class="text-right">Planned</th><th>Status</th></tr></thead>
                  <tbody><tr v-for="stage in schedule.stages" :key="stage.key"><td class="font-medium">{{ stage.label }}</td><td class="text-right">{{ days(stage.required) }}</td><td class="text-right">{{ days(stage.planned) }}</td><td><span :class="['badge badge-xs', stageBadge(stage.status)]">{{ stageStatus(stage.status) }}</span></td></tr></tbody>
                </table>
              </div>
            </div>
          </details>

          <details class="collapse collapse-arrow border border-base-300 bg-base-100">
            <summary class="collapse-title min-h-0 py-3 font-semibold">Flags</summary>
            <div class="collapse-content grid grid-cols-1 gap-px border-t border-base-200 bg-base-200 pt-0 sm:grid-cols-2 lg:grid-cols-3">
              <div v-for="flag in flagEntries" :key="flag.label" class="flex items-center justify-between gap-3 bg-base-100 px-4 py-2.5"><span class="text-sm text-base-content/65">{{ flag.label }}</span><span :class="['badge badge-sm', flag.value ? 'badge-success badge-soft' : 'badge-ghost']">{{ yesNo(flag.value) }}</span></div>
            </div>
          </details>

          <details v-if="item.msds" class="collapse collapse-arrow border border-base-300 bg-base-100">
            <summary class="collapse-title min-h-0 py-3 font-semibold">Minimum service delivery standard</summary>
            <div class="collapse-content whitespace-pre-line border-t border-base-200 pt-3 text-sm">{{ item.msds }}</div>
          </details>
        </div>

        <div class="modal-action">
          <button class="btn" type="button" @click="closeModal">Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  awardType: { type: String, default: null },
});

const effectiveAwardType = computed(() => props.awardType || props.item.award_type);
const schedule = computed(() => props.item.schedule_requirements ?? null);
const scheduleLabel = computed(() => ({
  EXEMPTED: 'Approved exemption',
  COMPLIANT: 'Meets configured periods',
  NON_COMPLIANT: 'Below required period',
  INCOMPLETE: 'Incomplete',
  CONFIGURATION_MISSING: 'Configuration required',
})[schedule.value?.status] || 'Not assessed');
const displayedScheduleLabel = computed(() => {
  if (schedule.value?.status === 'EXEMPTED') return scheduleLabel.value;
  return schedule.value?.exemption_adjusted
    ? `${scheduleLabel.value} · Exemption-adjusted`
    : scheduleLabel.value;
});
const scheduleBadge = computed(() => ({
  EXEMPTED: 'badge-success',
  COMPLIANT: 'badge-success',
  NON_COMPLIANT: 'badge-error',
  INCOMPLETE: 'badge-warning',
  CONFIGURATION_MISSING: 'badge-warning',
})[schedule.value?.status] || 'badge-ghost');

const dialogId = computed(() => `admin_item_view_modal_${props.item.id}`);

const openModal = () => document.getElementById(dialogId.value).showModal();
const closeModal = () => document.getElementById(dialogId.value).close();

const methodLabel = computed(() => {
  const m = props.item.procurementmethod;
  if (!m) return null;
  return m.code ? `${m.name} (${m.code})` : m.name;
});

const unspscLabel = computed(() => {
  const u = props.item.unspsc;
  if (!u) return '—';
  return `${u.code ?? ''} ${u.name ?? ''}`.trim() || '—';
});

const formatNum = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString();
};

const scheduleEntries = computed(() => [
  { label: 'EOI publication', value: formatDate(props.item.eoi_publication_date) },
  { label: 'EOI closing', value: formatDate(props.item.eoi_closing_date) },
  { label: 'Bid notice publication', value: formatDate(props.item.bid_notice_publication_date) },
  { label: 'Bid closing', value: formatDate(props.item.bid_closing_date) },
  { label: 'Award publication', value: formatDate(props.item.publish_award_notice) },
  { label: 'Contract signing', value: formatDate(props.item.contract_signing) },
  { label: 'Expected delivery', value: formatDate(props.item.expected_delivery_date) },
  { label: 'Cycle days', value: props.item.cycle_days ?? '—' },
  { label: 'Lead time days', value: props.item.lead_time_days ?? '—' },
]);

const flagEntries = computed(() => [
  { label: 'Pre-qualification', value: props.item.pre_qualification },
  { label: 'EOI', value: props.item.eoi },
  { label: 'SPOC', value: props.item.spoc },
  { label: 'Sustainable procurement', value: props.item.sustainable_procurement },
  { label: 'Affirmative procurement', value: props.item.affirmative_procurement },
  { label: 'Procurement exemption', value: props.item.procurement_exemption },
]);

const yesNo = (v) => (v ? 'Yes' : 'No');
const days = value => value === null || value === undefined ? 'Not configured' : `${value} days`;
const stageStatus = status => ({ pass: 'Meets minimum', fail: 'Below minimum', incomplete: 'Incomplete' })[status] || 'Not assessed';
const stageBadge = status => ({ pass: 'badge-success', fail: 'badge-error', incomplete: 'badge-warning' })[status] || 'badge-ghost';
const readable = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/^\w/, char => char.toUpperCase());
</script>
