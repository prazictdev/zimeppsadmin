<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Suspense Records</span>
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-2 mb-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search suspense records..."
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Source Type</th>
                <th>Reference</th>
                <th>Transaction Date</th>
                <th>Currency</th>
                <th class="text-right">Amount</th>
                <th>Account Type</th>
                <th>Bank Account</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filtered.length">
                <td colspan="11" class="text-center text-base-content/50">No suspense records found.</td>
              </tr>
              <tr v-for="(item, i) in filtered" :key="item.id">
                <td>{{ i + 1 }}</td>
                <td>{{ item.company?.name ?? '—' }}</td>
                <td><span class="badge badge-ghost badge-sm">{{ item.sourcetype }}</span></td>
                <td class="font-mono text-sm">{{ item.source?.referencenumber ?? '—' }}</td>
                <td>{{ item.source?.transactiondate ? formatDate(item.source.transactiondate) : '—' }}</td>
                <td>{{ item.currency?.code ?? '—' }}</td>
                <td class="text-right font-mono">{{ formatAmount(item.source?.amount ?? item.amount, item.currency?.code) }}</td>
                <td>{{ item.bank_account_type?.name ?? '—' }}</td>
                <td>{{ item.bank_account?.accountnumber ?? '—' }}</td>
                <td>
                  <span class="badge badge-sm" :class="statusClass(item.status)">
                    {{ item.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useSuspenseStore();
const search = ref('');

const filtered = computed(() =>
  store.items.filter(
    (item) =>
      item.company?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.sourcetype?.toLowerCase().includes(search.value.toLowerCase()) ||
      item.source?.referencenumber?.toLowerCase().includes(search.value.toLowerCase()) ||
      String(item.source_id).includes(search.value),
  ),
);

const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatAmount = (amount, currencyCode) => {
  if (amount == null) return '—';
  return `${currencyCode ? currencyCode + ' ' : ''}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const statusClass = (status) => ({
  'badge-warning': status === 'PENDING',
  'badge-success': status === 'UTILIZED',
});
</script>
