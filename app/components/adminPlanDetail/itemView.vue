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

        <div class="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Identification</div>
            <table class="table table-sm w-full">
              <tbody>
                <tr><th class="w-1/3 text-base-content/60">Reference No.</th><td class="font-mono">{{ item.reference_no || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Description</th><td class="whitespace-pre-line">{{ item.description || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Procurement Method</th><td>{{ methodLabel || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Procurement Group</th><td>{{ item.procurementgroup?.name || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Source of Funds</th><td>{{ item.sourceoffunds?.name || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Unit of Measure</th><td>{{ item.unitofmeasure?.name || '—' }}</td></tr>
                <tr><th class="text-base-content/60">UNSPSC</th><td>{{ unspscLabel }}</td></tr>
                <tr><th class="text-base-content/60">Expense Category</th><td>{{ item.expensecategory || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Award Type</th><td>{{ effectiveAwardType === 'FRAMEWORK' ? 'Framework' : 'Award' }}</td></tr>
                <tr><th class="text-base-content/60">Quarter</th><td>{{ item.quarter || '—' }}</td></tr>
              </tbody>
            </table>
          </section>

          <section v-if="item.procurement_exemption && item.exemption_grounds?.length" class="rounded border border-base-200 lg:col-span-2">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Approved exemption grounds</div>
            <div class="grid gap-3 p-3 md:grid-cols-2"><article v-for="ground in item.exemption_grounds" :key="ground.ground_uuid || ground.ground_id" class="rounded-lg border border-base-200 p-3"><span class="badge badge-outline badge-sm">{{ ground.type?.name || 'Exemption' }}</span><p class="mt-2 text-sm">{{ ground.justification }}</p><dl v-if="Object.keys(ground.approved_terms || {}).length" class="mt-2 grid grid-cols-2 gap-x-3 text-xs text-base-content/60"><template v-for="(value, key) in ground.approved_terms" :key="key"><dt>{{ readable(key) }}</dt><dd>{{ value ?? '—' }}</dd></template></dl></article></div>
          </section>

          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Costing</div>
            <table class="table table-sm w-full">
              <tbody>
                <tr><th class="w-1/3 text-base-content/60">Quantity</th><td class="font-mono">{{ formatNum(item.quantity) }}</td></tr>
                <tr><th class="text-base-content/60">Unit Cost</th><td class="font-mono">{{ formatNum(item.unit_cost) }}</td></tr>
                <tr><th class="text-base-content/60">Total Cost</th><td class="font-mono font-semibold">{{ formatNum(item.total_cost) }}</td></tr>
              </tbody>
            </table>
          </section>

          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Schedule</div>
            <table class="table table-sm w-full">
              <tbody>
                <tr><th class="w-1/3 text-base-content/60">EOI publication</th><td>{{ formatDate(item.eoi_publication_date) }}</td></tr>
                <tr><th class="text-base-content/60">EOI closing</th><td>{{ formatDate(item.eoi_closing_date) }}</td></tr>
                <tr><th class="text-base-content/60">Bid notice publication</th><td>{{ formatDate(item.bid_notice_publication_date) }}</td></tr>
                <tr><th class="text-base-content/60">Bid closing</th><td>{{ formatDate(item.bid_closing_date) }}</td></tr>
                <tr><th class="text-base-content/60">Award publication</th><td>{{ formatDate(item.publish_award_notice) }}</td></tr>
                <tr><th class="text-base-content/60">Contract signing</th><td>{{ formatDate(item.contract_signing) }}</td></tr>
                <tr><th class="text-base-content/60">Cycle days</th><td>{{ item.cycle_days ?? '—' }}</td></tr>
                <tr><th class="text-base-content/60">Lead time days</th><td>{{ item.lead_time_days ?? '—' }}</td></tr>
              </tbody>
            </table>
          </section>

          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Flags</div>
            <table class="table table-sm w-full">
              <tbody>
                <tr><th class="w-1/3 text-base-content/60">Pre-qualification</th><td>{{ yesNo(item.pre_qualification) }}</td></tr>
                <tr><th class="text-base-content/60">EOI</th><td>{{ yesNo(item.eoi) }}</td></tr>
                <tr><th class="text-base-content/60">SPOC (Special Oversight Committee)</th><td>{{ yesNo(item.spoc) }}</td></tr>
                <tr><th class="text-base-content/60">Sustainable procurement</th><td>{{ yesNo(item.sustainable_procurement) }}</td></tr>
                <tr><th class="text-base-content/60">Affirmative procurement</th><td>{{ yesNo(item.affirmative_procurement) }}</td></tr>
                <tr><th class="text-base-content/60">Procurement exemption</th><td>{{ yesNo(item.procurement_exemption) }}</td></tr>
              </tbody>
            </table>
          </section>

          <section v-if="item.msds" class="rounded border border-base-200 lg:col-span-2">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">MSDS</div>
            <div class="px-3 py-2 whitespace-pre-line text-sm">{{ item.msds }}</div>
          </section>
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

const yesNo = (v) => (v ? 'Yes' : 'No');
const readable = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/^\w/, char => char.toUpperCase());
</script>
