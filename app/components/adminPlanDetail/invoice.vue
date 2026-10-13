<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Authorization Invoice</span>
        <span v-if="invoice" :class="['badge', invoice.status === 'PAID' ? 'badge-success' : 'badge-warning']">{{ invoice.status }}</span>
      </div>

      <div v-if="!invoice" class="py-10 text-center text-sm text-base-content/60">
        No invoice has been raised yet.
      </div>

      <div v-else class="mt-3 space-y-4">
        <div role="alert" :class="['alert', invoice.status === 'PAID' ? 'alert-success' : 'alert-info']">
          <Icon :name="invoice.status === 'PAID' ? 'lucide:check-circle' : 'lucide:receipt'" />
          <div>
            <p class="font-semibold">
              <template v-if="invoice.status === 'PAID'">Invoice paid in full.</template>
              <template v-else>Outstanding balance: {{ invoice.currency?.symbol || '' }} {{ formatAmount(invoice.remaining_balance) }}</template>
            </p>
            <p class="text-sm">
              Invoice number: <span class="font-mono">{{ invoice.invoice_number }}</span>
              · Payment reference: <span class="font-mono">{{ invoice.paymentreference }}</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Invoice</div>
            <table class="table table-sm w-full">
              <tbody>
                <tr><th class="w-1/3 text-base-content/60">Invoice number</th><td class="font-mono">{{ invoice.invoice_number }}</td></tr>
                <tr><th class="text-base-content/60">Payment reference</th><td class="font-mono">{{ invoice.paymentreference }}</td></tr>
                <tr><th class="text-base-content/60">Status</th><td><span :class="['badge', invoice.status === 'PAID' ? 'badge-success' : 'badge-warning']">{{ invoice.status }}</span></td></tr>
                <tr><th class="text-base-content/60">Invoice date</th><td>{{ formatDate(invoice.invoice_date) }}</td></tr>
                <tr><th class="text-base-content/60">Currency</th><td>{{ invoice.currency?.code }}<span v-if="invoice.currency?.symbol"> ({{ invoice.currency.symbol }})</span></td></tr>
                <tr><th class="text-base-content/60">Inventory item</th><td>{{ invoice.inventoryitem?.name || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Bank account type</th><td>{{ invoice.inventoryitem?.bankaccounttype?.name || '—' }}</td></tr>
                <tr><th class="text-base-content/60">Amount due</th><td class="font-mono font-semibold">{{ formatAmount(invoice.total) }}</td></tr>
                <tr><th class="text-base-content/60">Receipted</th><td class="font-mono">{{ formatAmount(invoice.total_receipted) }}</td></tr>
                <tr><th class="text-base-content/60">Outstanding</th><td class="font-mono font-semibold">{{ formatAmount(invoice.remaining_balance) }}</td></tr>
              </tbody>
            </table>
          </section>

          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">Receipts</div>
            <table v-if="invoice.receipts?.length" class="table table-sm w-full">
              <thead>
                <tr class="text-left">
                  <th>#</th>
                  <th>Receipt no.</th>
                  <th>Date</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in invoice.receipts" :key="r.id">
                  <td>{{ i + 1 }}</td>
                  <td class="font-mono text-xs">{{ r.receipt_number }}</td>
                  <td>{{ formatDate(r.receipt_date) }}</td>
                  <td class="text-right font-mono">{{ formatAmount(r.amount) }}</td>
                </tr>
              </tbody>
            </table>
            <p v-else class="px-3 py-4 text-sm text-base-content/60">No receipts yet.</p>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useAdminPlanStore();
const invoice = computed(() => store.invoice);

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString();
};
</script>
