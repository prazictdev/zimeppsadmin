<template>
  <section class="grid gap-3 xl:grid-cols-2">
    <article class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <header class="flex items-center justify-between border-b border-base-200 px-4 py-3">
        <div>
          <h3 class="font-bold">Totals by award type</h3>
          <p class="mt-0.5 text-xs text-base-content/50">Consolidated groups count as one procurement.</p>
        </div>
        <Icon name="lucide:award" class="h-5 w-5 text-base-content/40" />
      </header>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead><tr><th>Award type</th><th class="text-right">Items</th><th class="text-right">Total value</th></tr></thead>
          <tbody>
            <tr v-for="row in awardRows" :key="row.key">
              <td class="font-semibold">{{ awardLabel(row) }}</td>
              <td class="text-right tabular-nums">{{ row.count }}</td>
              <td class="text-right"><p class="font-semibold tabular-nums">{{ money(row.total) }}</p><p class="text-xs text-base-content/45">{{ percentage(row.total) }}</p></td>
            </tr>
          </tbody>
          <tfoot><tr><th>Total</th><th class="text-right tabular-nums">{{ awardItemCount }}</th><th class="text-right tabular-nums">{{ money(planTotal) }}</th></tr></tfoot>
        </table>
      </div>
    </article>

    <article class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <header class="flex items-center justify-between border-b border-base-200 px-4 py-3">
        <div>
          <h3 class="font-bold">Totals by SPOC</h3>
          <p class="mt-0.5 text-xs text-base-content/50">Consolidated groups count as one procurement at their combined value.</p>
        </div>
        <Icon name="lucide:shield-check" class="h-5 w-5 text-base-content/40" />
      </header>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead><tr><th>SPOC status</th><th class="text-right">Items</th><th class="text-right">Total value</th></tr></thead>
          <tbody>
            <tr v-for="row in spocRows" :key="row.key">
              <td class="font-semibold">{{ row.label }}</td>
              <td class="text-right tabular-nums">{{ row.count }}</td>
              <td class="text-right"><p class="font-semibold tabular-nums">{{ money(row.total) }}</p><p class="text-xs text-base-content/45">{{ percentage(row.total) }}</p></td>
            </tr>
          </tbody>
          <tfoot><tr><th>Total</th><th class="text-right tabular-nums">{{ spocItemCount }}</th><th class="text-right tabular-nums">{{ money(planTotal) }}</th></tr></tfoot>
        </table>
      </div>
    </article>
  </section>
</template>

<script setup>
const store = useAdminPlanStore();

const awardRows = computed(() => store.totalsByAwardType ?? []);
const awardItemCount = computed(() => awardRows.value.reduce((sum, row) => sum + Number(row.count || 0), 0));
const planTotal = computed(() => (store.totals ?? []).reduce((sum, row) => sum + Number(row.total || 0), 0));
const spocRows = computed(() => store.totalsBySpoc ?? []);
const spocItemCount = computed(() => spocRows.value.reduce((sum, row) => sum + Number(row.count || 0), 0));

const currencyPrefix = computed(() => {
  const currency = store.plan?.currency;
  if (!currency) return '';
  return currency.symbol ? `${currency.symbol} ` : `${currency.code} `;
});

const awardLabel = row => row.key === 'FRAMEWORK' ? 'Framework' : row.label;
const money = value => `${currencyPrefix.value}${Number(value || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const percentage = value => planTotal.value > 0 ? `${((Number(value || 0) / planTotal.value) * 100).toFixed(1)}% of plan` : '0.0% of plan';
</script>
