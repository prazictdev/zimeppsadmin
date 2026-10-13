<template>
  <div class="overflow-hidden rounded-xl border border-base-200">
    <button
      type="button"
      class="flex w-full items-center gap-2 bg-base-200/40 px-3 py-2.5 text-left transition-colors hover:bg-base-200/60"
      @click="expanded = !expanded"
    >
      <Icon :name="expanded ? 'lucide:chevron-down' : 'lucide:chevron-right'" class="h-4 w-4 shrink-0" />
      <span class="badge badge-neutral badge-sm shrink-0">Consolidated</span>
      <span class="min-w-0 flex-1">
        <span class="block truncate font-semibold" :title="group.name">{{ group.name || group.reference_no }}</span>
        <span class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/50">
          <span class="font-mono">{{ group.reference_no }}</span>
          <span class="opacity-40">·</span>
          <span>{{ group.item_count }} items</span>
          <span class="opacity-40">·</span>
          <span class="inline-flex items-center gap-1">
            <Icon name="lucide:boxes" class="h-3 w-3" />
            {{ groupLabel }}
          </span>
          <span class="opacity-40">·</span>
          <span class="inline-flex items-center gap-1">
            <Icon name="lucide:gavel" class="h-3 w-3" />
            {{ methodLabel }}
          </span>
          <span class="opacity-40">·</span>
          <span class="badge badge-ghost badge-xs">{{ awardTypeLabel }}</span>
        </span>
      </span>
      <span class="flex shrink-0 items-baseline gap-4 text-right">
        <span class="text-xs text-base-content/60">
          <span class="font-semibold">Total Qnty</span> {{ formatNum(group.total_quantity) }}
        </span>
        <span class="text-xs text-base-content/60">
          <span class="font-semibold">Total Value</span>
          <span class="ml-1 font-mono text-sm font-semibold text-base-content/80">{{ currency }}{{ formatNum(group.total_budget) }}</span>
        </span>
      </span>
    </button>

    <div v-if="expanded" class="divide-y divide-base-200 border-t border-base-200">
      <AdminPlanDetailPlanItemRow
        v-for="child in group.children"
        :key="child.id"
        :item="child"
        :award-type="group.award_type"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  group: { type: Object, required: true },
  currency: { type: String, default: '' },
});

const expanded = ref(false);

const formatNum = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Procurement group/method for the whole consolidation — the shared value, or
// "Mixed" when children differ.
const distinctLabel = (relation, rawKey) => {
  const labels = new Set();
  for (const child of props.group.children ?? []) {
    const name = child[relation]?.name || (child[rawKey] ? `"${child[rawKey]}"` : null);
    if (name) labels.add(name);
  }
  if (labels.size === 0) return '—';
  if (labels.size === 1) return [...labels][0];
  return 'Mixed';
};

const groupLabel = computed(() => distinctLabel('procurementgroup', 'raw_procurementgroup_code'));
const methodLabel = computed(() => distinctLabel('procurementmethod', 'raw_procurementmethod_code'));
const awardTypeLabel = computed(() => {
  if (props.group.award_type === 'FRAMEWORK') return 'Framework';
  if (props.group.award_type === 'AWARD') return 'Award';
  return 'Mixed award type';
});
</script>
