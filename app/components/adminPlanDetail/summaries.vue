<template>
  <div v-if="hasAny" class="grid grid-cols-1 gap-3 2xl:grid-cols-3">
    <div v-if="store.totals.length" class="overflow-x-auto rounded border border-base-200">
      <div class="flex items-center justify-between border-b border-base-200 bg-base-200/40 px-3 py-2">
        <div class="text-sm font-semibold">Totals by Procurement Method</div>
        <div class="text-xs text-base-content/60">{{ totalItems }} item{{ totalItems === 1 ? '' : 's' }}</div>
      </div>
      <table class="table table-sm w-full min-w-[22rem]">
        <thead>
          <tr class="text-left">
            <th>Method</th>
            <th class="text-right">Items</th>
            <th class="text-right">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in store.totals" :key="row.key">
            <td>
              <span v-if="row.unresolved" class="text-warning">{{ row.label }}</span>
              <span v-else>{{ row.label }}</span>
            </td>
            <td class="text-right">{{ row.count }}</td>
            <td class="text-right">
              <div class="font-mono">{{ formatAmount(row.total) }}</div>
              <div class="mt-0.5 text-xs text-base-content/45">{{ percentage(row.total, planTotal) }} of plan</div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-semibold">
            <td>Total</td>
            <td class="text-right">{{ totalItems }}</td>
            <td class="text-right"><div class="font-mono">{{ formatAmount(planTotal) }}</div><div class="mt-0.5 text-xs text-base-content/45">{{ percentage(planTotal, planTotal) }} of plan</div></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="store.totalsByGroup.length" class="overflow-x-auto rounded border border-base-200">
      <div class="flex items-center justify-between border-b border-base-200 bg-base-200/40 px-3 py-2">
        <div class="text-sm font-semibold">Totals by Procurement Group</div>
        <div class="text-xs text-base-content/60">{{ totalItems }} item{{ totalItems === 1 ? '' : 's' }}</div>
      </div>
      <table class="table table-sm w-full min-w-[22rem]">
        <thead>
          <tr class="text-left">
            <th>Group</th>
            <th class="text-right">Items</th>
            <th class="text-right">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in store.totalsByGroup" :key="row.key">
            <td>
              <span v-if="row.unresolved" class="text-warning">{{ row.label }}</span>
              <span v-else>{{ row.label }}</span>
            </td>
            <td class="text-right">{{ row.count }}</td>
            <td class="text-right">
              <div class="font-mono">{{ formatAmount(row.total) }}</div>
              <div class="mt-0.5 text-xs text-base-content/45">{{ percentage(row.total, planGroupTotal) }} of plan</div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="font-semibold">
            <td>Total</td>
            <td class="text-right">{{ totalItems }}</td>
            <td class="text-right"><div class="font-mono">{{ formatAmount(planGroupTotal) }}</div><div class="mt-0.5 text-xs text-base-content/45">{{ percentage(planGroupTotal, planGroupTotal) }} of plan</div></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div v-if="store.totalsByFlag.length" class="overflow-x-auto rounded border border-base-200">
      <div class="flex items-center justify-between border-b border-base-200 bg-base-200/40 px-3 py-2">
        <div class="text-sm font-semibold">Totals by Flag</div>
        <div class="text-xs text-base-content/60">{{ totalItems }} item{{ totalItems === 1 ? '' : 's' }}</div>
      </div>
      <table class="table table-sm w-full min-w-[22rem]">
        <thead>
          <tr class="text-left">
            <th>Flag</th>
            <th class="text-right">Items</th>
            <th class="text-right">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in store.totalsByFlag" :key="row.key">
            <td>{{ row.label }}</td>
            <td class="text-right">{{ row.count }}</td>
            <td class="text-right">
              <div class="font-mono">{{ formatAmount(row.total) }}</div>
              <div class="mt-0.5 text-xs text-base-content/45">{{ percentage(row.total, planTotal) }} of plan</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const store = useAdminPlanStore();

const hasAny = computed(() =>
  store.totals.length > 0 || store.totalsByGroup.length > 0 || store.totalsByFlag.length > 0,
);

const totalItems = computed(() => store.plan?.items_count ?? store.individualMeta?.total ?? 0);

const planTotal = computed(() =>
  (store.totals ?? []).reduce((s, r) => s + (Number(r.total) || 0), 0),
);

const planGroupTotal = computed(() =>
  (store.totalsByGroup ?? []).reduce((s, r) => s + (Number(r.total) || 0), 0),
);

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const percentage = (value, total) => {
  const numericValue = Number(value);
  const numericTotal = Number(total);
  if (!Number.isFinite(numericValue) || !Number.isFinite(numericTotal) || numericTotal <= 0) return '—';
  return `${((numericValue / numericTotal) * 100).toFixed(1)}%`;
};
</script>
