<template>
  <div class="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
    <div class="p-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">
            <Icon name="lucide:clipboard-list" class="h-4 w-4" />
            Annual Procurement Plan
          </div>
          <h1 class="mt-1 flex flex-wrap items-baseline gap-x-3 text-2xl font-bold tracking-tight">
            <span>{{ store.plan?.year ?? '…' }}</span>
            <span class="text-base-content/25">/</span>
            <span class="text-base-content/80">{{ store.plan?.company?.name ?? '' }}</span>
          </h1>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <span :class="['badge badge-sm gap-1.5', stageBadge(store.plan?.status)]">
              <Icon name="lucide:circle-dot" class="h-3.5 w-3.5" />
              {{ formatStatus(store.plan?.status) }}
            </span>
            <span v-if="store.plan?.paymentstatus" :class="['badge badge-sm gap-1.5', paymentBadge(store.plan.paymentstatus)]">
              <Icon name="lucide:credit-card" class="h-3.5 w-3.5" />
              {{ formatStatus(store.plan.paymentstatus) }}
            </span>
            <span v-if="store.plan?.currency" class="badge badge-sm badge-outline gap-1.5">
              <Icon name="lucide:coins" class="h-3.5 w-3.5" />
              {{ store.plan.currency.code }}<template v-if="store.plan.currency.symbol"> · {{ store.plan.currency.symbol }}</template>
            </span>
            <span v-if="store.plan?.procurementclass" class="badge badge-sm badge-ghost gap-1.5">
              <Icon name="lucide:shapes" class="h-3.5 w-3.5" />
              {{ store.plan.procurementclass.name }}
            </span>
          </div>
          <p v-if="store.plan?.notes?.class_approval" class="mt-2 text-sm text-base-content/60">
            Applied for: {{ store.plan.notes.class_approval.applied_class_name || 'Not specified' }} · Approved as: {{ store.plan.notes.class_approval.approved_class_name }}
          </p>
          <div v-if="store.plan?.submitted_at" class="mt-3 flex items-center gap-1.5 text-xs text-base-content/50">
            <Icon name="lucide:send" class="h-3.5 w-3.5" />
            Submitted on {{ formatTime(store.plan.submitted_at) }}
          </div>
        </div>

        <div v-if="store.plan?.uuid" class="flex flex-wrap items-center gap-2">
          <AdminPlanDetailActionPanel :plan-uuid="store.plan.uuid" />
          <AdminPlanDetailAnalyze :plan-uuid="store.plan.uuid" />
        </div>
      </div>

      <!-- Stat strip -->
      <div class="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border border-base-200 sm:grid-cols-4">
        <div class="border-b border-r border-base-200 p-3 sm:border-b-0">
          <div class="flex items-center gap-1.5 text-xs font-medium text-base-content/50">
            <Icon name="lucide:wallet" class="h-4 w-4" /> Total Budget
          </div>
          <div class="mt-1 truncate font-mono text-xl font-bold" :title="formatAmount(planTotal)">
            <span class="text-sm text-base-content/50">{{ currencySymbol }}</span>{{ formatAmount(planTotal) }}
          </div>
        </div>
        <div class="border-b border-base-200 p-3 sm:border-b-0 sm:border-r">
          <div class="flex items-center gap-1.5 text-xs font-medium text-base-content/50">
            <Icon name="lucide:list" class="h-4 w-4" /> Plan Items
          </div>
          <div class="mt-1 text-xl font-bold">{{ totalItems }}</div>
        </div>
        <div class="border-r border-base-200 p-3">
          <div class="flex items-center gap-1.5 text-xs font-medium text-base-content/50">
            <Icon name="lucide:layers" class="h-4 w-4" /> Consolidated
          </div>
          <div class="mt-1 text-xl font-bold">{{ store.consolidated.length }}</div>
        </div>
        <div class="p-3">
          <div class="flex items-center gap-1.5 text-xs font-medium text-base-content/50">
            <Icon name="lucide:wallet-cards" class="h-4 w-4" /> Payment
          </div>
          <div class="mt-1 text-base font-bold">{{ formatStatus(store.plan?.paymentstatus) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useAdminPlanStore();

const totalItems = computed(() => store.plan?.items_count ?? store.individualMeta?.total ?? 0);

// Plan total = sum of every server-aggregated method bucket's total.
const planTotal = computed(() =>
  (store.totals ?? []).reduce((sum, row) => sum + (Number(row.total) || 0), 0),
);

const currencySymbol = computed(() => {
  const c = store.plan?.currency;
  if (!c) return '';
  return c.symbol ? `${c.symbol} ` : `${c.code} `;
});

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatStatus = (s) => {
  if (!s) return '—';
  return s.split('_').map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
};

const paymentBadge = (s) => {
  if (s === 'PAID') return 'badge-success';
  if (s === 'PARTIALLY_PAID') return 'badge-info';
  if (s === 'PENDING') return 'badge-warning';
  if (s === 'OVERDUE') return 'badge-error';
  return 'badge-ghost';
};

const stageBadge = (s) => {
  if (s === 'DRAFT' || s === 'PENDING_REVIEW') return 'badge-warning badge-outline';
  if (s === 'PENDING_INTERNAL_APPROVAL') return 'badge-warning';
  if (s === 'PENDING_ADMIN_AUTHORIZATION') return 'badge-info badge-outline';
  if (s === 'PENDING_MANAGER_REVIEW' || s === 'PENDING_APPROVER_DECISION') return 'badge-info';
  if (s === 'AUTHORIZED') return 'badge-success badge-outline';
  if (s === 'ACTIVE') return 'badge-success';
  return 'badge-ghost';
};

const formatTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
};
</script>
