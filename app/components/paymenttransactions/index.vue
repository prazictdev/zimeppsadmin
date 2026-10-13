<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-3">
        <span class="text-lg font-bold">Payment Transactions</span>
      </div>

      <!-- Date range filter -->
      <div class="mt-2 mb-4 flex flex-wrap items-end gap-3">
        <label class="fieldset">
          <span class="fieldset-legend">From</span>
          <input v-model="from" type="date" class="input input-bordered input-sm" />
        </label>
        <label class="fieldset">
          <span class="fieldset-legend">To</span>
          <input v-model="to" type="date" class="input input-bordered input-sm" />
        </label>
        <button class="btn btn-primary btn-sm" @click="search">
          <Icon name="lucide:search" />
          Search
        </button>
        <button class="btn btn-ghost btn-sm" @click="clearFilters">Clear</button>
      </div>

      <div v-if="store.loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else>
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Source Ref</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Status</th>
              <th>Attempts</th>
              <th>Flagged</th>
              <th>Submitted</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.items.length">
              <td colspan="11" class="py-8 text-center text-base-content/40">
                <Icon name="lucide:inbox" class="mx-auto mb-1 h-6 w-6" />
                No payment transactions found for the selected period.
              </td>
            </tr>

            <tr v-for="(item, idx) in store.items" :key="item.id">
              <td class="text-sm text-base-content/50">{{ idx + 1 }}</td>
              <td>{{ item.company_name ?? '—' }}</td>
              <td><code class="rounded bg-base-200 px-2 py-0.5 text-sm">{{ item.source_reference ?? '—' }}</code></td>
              <td>{{ item.method ?? '—' }}</td>
              <td class="font-mono text-right">
                {{ item.currency_code }} {{ Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </td>
              <td>{{ formatDate(item.payment_date) }}</td>
              <td>
                <span class="badge badge-sm" :class="statusClass(item.status)">{{ item.status }}</span>
              </td>
              <td class="text-center">{{ item.verification_attempts ?? 0 }}</td>
              <td>
                <span v-if="item.flagged_for_manual" class="badge badge-error badge-sm">Manual</span>
                <span v-else class="badge badge-ghost badge-sm">Auto</span>
              </td>
              <td class="text-sm">{{ formatDate(item.created_at) }}</td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-1">
                  <PaymenttransactionsShow :item="item" />
                  <PaymenttransactionsLogs :item="item" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="store.pagination && store.pagination.last_page > 1" class="mt-4 flex justify-center gap-1">
          <button
            v-for="page in store.pagination.last_page"
            :key="page"
            class="btn btn-sm"
            :class="page === store.pagination.current_page ? 'btn-primary' : 'btn-ghost'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = usePaymentTransactionStore()

const today = new Date()
const from = ref(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10))
const to = ref(today.toISOString().slice(0, 10))

const search = () => store.fetchAll({ from: from.value, to: to.value })

const clearFilters = () => {
  from.value = ''
  to.value = ''
  store.fetchAll({})
}

const goToPage = (page) => store.fetchAll({ from: from.value, to: to.value, page })

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const statusClass = (status) => ({
  'badge-warning': status === 'PENDING',
  'badge-success': status === 'VERIFIED',
  'badge-error': status === 'REJECTED',
})
</script>
