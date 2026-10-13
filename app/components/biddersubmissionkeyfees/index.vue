<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Bid Submission Key Fees</span>
        <BiddersubmissionkeyfeesAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <input
          v-model="search"
          type="text"
          placeholder="Filter by description or SI..."
          class="input input-bordered w-full max-w-xs mt-2"
        />
        <table class="table table-zebra w-full mt-2">
          <thead>
            <tr>
              <th>#</th>
              <th>Bidder type</th>
              <th>Currency</th>
              <th>Bank account</th>
              <th class="text-right">Amount</th>
              <th>Effective from</th>
              <th>Effective to</th>
              <th>SI / source</th>
              <th>Description</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="10" class="text-center text-base-content/50 py-6">No fees configured.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>
                <span :class="['badge badge-sm', item.bidder_type === 'DOMESTIC' ? 'badge-info' : 'badge-warning']">
                  {{ item.bidder_type }}
                </span>
              </td>
              <td class="font-mono text-xs">{{ item.currency?.code || '—' }}</td>
              <td class="text-xs">
                <template v-if="item.inventoryitem">
                  <p>{{ item.inventoryitem.name }}</p>
                  <p v-if="item.inventoryitem.bankaccounttype" class="text-base-content/60">{{ item.inventoryitem.bankaccounttype.name }}</p>
                </template>
                <span v-else class="badge badge-warning badge-sm">Not set</span>
              </td>
              <td class="text-right font-mono">{{ formatAmount(item.amount) }}</td>
              <td class="text-xs">{{ formatDate(item.effective_from) }}</td>
              <td class="text-xs">
                <span v-if="item.effective_to">{{ formatDate(item.effective_to) }}</span>
                <span v-else class="badge badge-ghost badge-sm">Active</span>
              </td>
              <td class="text-xs text-base-content/70">{{ item.source_si || '—' }}</td>
              <td class="text-xs text-base-content/70 max-w-xs truncate" :title="item.description">{{ item.description || '—' }}</td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <BiddersubmissionkeyfeesView :item="item" />
                  <BiddersubmissionkeyfeesEdit v-if="canEdit" :item="item" />
                  <BiddersubmissionkeyfeesDelete v-if="canDelete" :item="item" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useBidderSubmissionKeyFeeStore();
const search = ref('');

defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const filtered = computed(() =>
  store.items.filter((i) => {
    if (!search.value) return true;
    const q = search.value.toLowerCase();
    return (
      i.description?.toLowerCase().includes(q) ||
      i.source_si?.toLowerCase().includes(q) ||
      i.currency?.code?.toLowerCase().includes(q) ||
      i.bidder_type?.toLowerCase().includes(q)
    );
  }),
);

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : '—');
</script>
