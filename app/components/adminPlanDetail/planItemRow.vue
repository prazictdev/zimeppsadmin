<template>
  <div
    class="flex items-start justify-between gap-3 px-3 py-3 transition-colors hover:bg-base-200/40"
    :class="{ 'bg-warning/5': isUnresolved }"
  >
    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-2">
        <Icon
          v-if="isUnresolved"
          name="lucide:alert-triangle"
          class="h-3.5 w-3.5 shrink-0 text-warning"
          title="Has unresolved values"
        />
        <span class="font-medium" :title="item.description">{{ item.description }}</span>
      </div>
      <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-base-content/60">
        <span v-if="item.reference_no" class="badge badge-ghost badge-xs font-mono">{{ item.reference_no }}</span>
        <span class="inline-flex items-center gap-1" :class="groupWarn ? 'text-warning' : ''">
          <Icon name="lucide:boxes" class="h-3 w-3" />
          {{ groupLabel }}
        </span>
        <span class="opacity-30">·</span>
        <span class="inline-flex items-center gap-1" :class="methodWarn ? 'text-warning' : ''">
          <Icon name="lucide:gavel" class="h-3 w-3" />
          {{ methodLabel }}
        </span>
        <span v-if="item.quarter" class="badge badge-outline badge-xs">{{ item.quarter }}</span>
        <span class="badge badge-ghost badge-xs">{{ effectiveAwardType === 'FRAMEWORK' ? 'Framework' : 'Award' }}</span>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-3">
      <div class="text-right">
        <div class="font-mono text-sm font-semibold">{{ formatNum(item.total_cost) }}</div>
        <div class="text-xs text-base-content/50">
          {{ formatNum(item.quantity) }} × {{ formatNum(item.unit_cost) }}
        </div>
      </div>
      <AdminPlanDetailItemView :item="item" :award-type="awardType" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  awardType: { type: String, default: null },
});

const effectiveAwardType = computed(() => props.awardType || props.item.award_type);

const formatNum = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const groupWarn = computed(() => !props.item.procurementgroup && !!props.item.raw_procurementgroup_code);
const methodWarn = computed(() => !props.item.procurementmethod && !!props.item.raw_procurementmethod_code);

const groupLabel = computed(() =>
  props.item.procurementgroup?.name
  || (props.item.raw_procurementgroup_code ? `"${props.item.raw_procurementgroup_code}"` : '—'),
);
const methodLabel = computed(() =>
  props.item.procurementmethod?.name
  || (props.item.raw_procurementmethod_code ? `"${props.item.raw_procurementmethod_code}"` : '—'),
);

const isUnresolved = computed(() =>
  (props.item.raw_procurementmethod_code != null && !props.item.procurementmethod_id)
  || (props.item.raw_procurementgroup_code != null && !props.item.procurementgroup_id)
  || (props.item.raw_sourceoffunds_name != null && !props.item.sourceoffunds_id)
  || (props.item.raw_unitofmeasure_name != null && !props.item.unitofmeasure_id),
);
</script>
