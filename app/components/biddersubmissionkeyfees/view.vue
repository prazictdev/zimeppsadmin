<template>
  <div>
    <button class="btn btn-ghost btn-sm" @click="openModal">
      <Icon name="lucide:eye" />
      <span class="hidden md:block">View</span>
    </button>
    <dialog :id="`view_bidderkeyfee_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Fee Detail</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('view_bidderkeyfee_modal_${item.id}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <table class="table table-xs mt-3">
          <tbody>
            <tr><td class="text-base-content/60 w-1/3">Bidder type</td><td>
              <span :class="['badge badge-sm', item.bidder_type === 'DOMESTIC' ? 'badge-info' : 'badge-warning']">{{ item.bidder_type }}</span>
            </td></tr>
            <tr><td class="text-base-content/60">Currency</td><td class="font-mono">{{ item.currency?.code }} — {{ item.currency?.name }}</td></tr>
            <tr><td class="text-base-content/60">Bank routing</td><td>
              <template v-if="item.inventoryitem">{{ item.inventoryitem.name }}<span v-if="item.inventoryitem.bankaccounttype"> · {{ item.inventoryitem.bankaccounttype.name }}</span></template>
              <span v-else class="badge badge-warning badge-sm">Not set</span>
            </td></tr>
            <tr><td class="text-base-content/60">Amount</td><td class="font-mono">{{ formatAmount(item.amount) }}</td></tr>
            <tr><td class="text-base-content/60">Effective from</td><td>{{ formatDate(item.effective_from) }}</td></tr>
            <tr><td class="text-base-content/60">Effective to</td><td>
              <span v-if="item.effective_to">{{ formatDate(item.effective_to) }}</span>
              <span v-else class="badge badge-ghost badge-sm">Active (no end date)</span>
            </td></tr>
            <tr><td class="text-base-content/60">SI / source</td><td>{{ item.source_si || '—' }}</td></tr>
            <tr><td class="text-base-content/60">Description</td><td>{{ item.description || '—' }}</td></tr>
          </tbody>
        </table>
        <div class="modal-action">
          <button class="btn" type="button" :onclick="`document.getElementById('view_bidderkeyfee_modal_${item.id}').close()`">Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
defineProps({ item: { type: Object, required: true } });

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');
</script>
