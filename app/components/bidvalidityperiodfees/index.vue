<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <div>
          <span class="text-lg font-bold">Bid Security Establishment Fees</span>
          <p class="text-xs text-base-content/60">
            Tiered by bid-security amount and validity period (S.I. 9 of 2026, Part V).
          </p>
        </div>
        <BidvalidityperiodfeesAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <select v-model.number="periodFilter" class="select select-bordered max-w-xs">
            <option :value="null">All validity periods</option>
            <option v-for="p in periods" :key="p" :value="p">{{ p }} days</option>
          </select>
          <select v-model="localityFilter" class="select select-bordered max-w-xs">
            <option value="">All localities</option>
            <option value="local">Local (domestic)</option>
            <option value="foreign">Foreign</option>
            <option value="all">All</option>
          </select>
        </div>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Validity</th>
              <th>Locality</th>
              <th>Currency</th>
              <th>Bid security band</th>
              <th class="text-right">Establishment fee</th>
              <th>Extension</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="8" class="text-center text-base-content/50">No fee bands found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.bid_validity_period }} days</td>
              <td><span class="badge badge-ghost badge-sm">{{ localityLabel(item.locality) }}</span></td>
              <td>{{ item.currency?.code ?? '—' }}</td>
              <td class="whitespace-nowrap">{{ formatBand(item) }}</td>
              <td class="text-right font-mono">{{ formatFee(item) }}</td>
              <td class="whitespace-nowrap text-xs text-base-content/70">{{ formatExtension(item) }}</td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <BidvalidityperiodfeesEdit v-if="canEdit" :item="item" />
                  <BidvalidityperiodfeesDelete v-if="canDelete" :item="item" />
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
const store = useBidValidityPeriodFeeStore();
const periodFilter = ref(null);
const localityFilter = ref('');

defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const localityLabel = (l) => ({ local: 'Local', foreign: 'Foreign', all: 'All' }[l] ?? l);

const money = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatBand = (item) => {
  const min = money(item.min_amount);
  if (item.max_amount == null) return `${item.currency?.code ?? ''} ${min} and above`.trim();
  return `${item.currency?.code ?? ''} ${min} – ${money(item.max_amount)}`.trim();
};

const formatFee = (item) => {
  if (item.fee != null) return money(item.fee);
  if (item.fee_percentage != null) return `${Number(item.fee_percentage)}% of bid security`;
  return '—';
};

const formatExtension = (item) => {
  if (item.extension_days && item.extension_percentage != null) {
    return `${Number(item.extension_percentage)}% / ${item.extension_days}d`;
  }
  return '—';
};

const periods = computed(() =>
  [...new Set(store.items.map((i) => Number(i.bid_validity_period)))].sort((a, b) => a - b),
);

const filtered = computed(() =>
  store.items
    .filter((i) => {
      const matchesPeriod = periodFilter.value == null || Number(i.bid_validity_period) === periodFilter.value;
      const matchesLocality = !localityFilter.value || i.locality === localityFilter.value;
      return matchesPeriod && matchesLocality;
    })
    .sort(
      (a, b) =>
        Number(a.bid_validity_period) - Number(b.bid_validity_period) ||
        String(a.locality).localeCompare(String(b.locality)) ||
        Number(a.min_amount) - Number(b.min_amount),
    ),
);
</script>
