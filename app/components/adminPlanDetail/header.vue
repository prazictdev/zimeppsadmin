<template>
  <header class="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow-sm">
    <div class="flex min-w-max items-stretch border-l-4 border-success">
      <div class="flex min-w-64 items-center gap-3 px-5 py-4">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
          <Icon name="lucide:clipboard-list" class="h-5 w-5" />
        </span>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold">{{ store.plan?.year ?? '…' }}</h1>
            <span v-if="store.plan?.procurementclass" class="badge badge-sm badge-outline whitespace-nowrap">
              Required class: {{ store.plan.procurementclass.name }}
            </span>
          </div>
          <p class="max-w-48 truncate text-xs text-base-content/55">{{ store.plan?.company?.name ?? '' }}</p>
        </div>
      </div>

      <dl class="flex items-stretch">
        <div class="flex min-w-60 items-center gap-3 border-l border-base-200 px-5 py-4">
          <Icon name="lucide:wallet" class="h-4 w-4 text-base-content/40" />
          <dt class="text-sm text-base-content/50">Total budget</dt>
          <dd class="ml-auto whitespace-nowrap font-mono font-bold">
            <span class="mr-1 text-xs text-base-content/50">{{ currencyCode }}</span>{{ formatAmount(planTotal) }}
          </dd>
        </div>
        <div class="flex min-w-40 items-center gap-3 border-l border-base-200 px-5 py-4">
          <Icon name="lucide:list" class="h-4 w-4 text-base-content/40" />
          <dt class="text-sm text-base-content/50">Plan items</dt>
          <dd class="ml-auto font-bold">{{ totalItems }}</dd>
        </div>
        <div class="flex min-w-44 items-center gap-3 border-l border-base-200 px-5 py-4">
          <Icon name="lucide:layers" class="h-4 w-4 text-base-content/40" />
          <dt class="text-sm text-base-content/50">Consolidated</dt>
          <dd class="ml-auto font-bold text-success">{{ store.consolidated.length }}</dd>
        </div>
      </dl>

      <div v-if="store.plan?.uuid" class="ml-auto flex items-center border-l border-base-200 px-5 py-4">
        <AdminPlanDetailActionPanel :plan-uuid="store.plan.uuid" />
      </div>
    </div>
  </header>
</template>

<script setup>
const store = useAdminPlanStore()

const totalItems = computed(() => store.plan?.items_count ?? store.individualMeta?.total ?? 0)
const planTotal = computed(() => (store.totals ?? []).reduce((sum, row) => sum + (Number(row.total) || 0), 0))
const currencyCode = computed(() => store.plan?.currency?.code || store.plan?.currency?.symbol || '')

const formatAmount = value => {
  const amount = Number(value)
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'
}

</script>
