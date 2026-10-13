<template>
  <ReportsSectionShell
    :narrative="narrative"
    :citations="citations"
    :instructions="instructions"
    :is-empty="!data.length"
  >
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(card, index) in data"
        :key="index"
        class="rounded-xl border border-base-200 bg-base-100 p-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wide text-base-content/50">
            {{ card.label }}
          </span>
          <Icon
            v-if="card.trend"
            :name="trendIcon(card.trend)"
            :class="['h-4 w-4', trendClass(card.trend)]"
          />
        </div>
        <div class="mt-2 text-2xl font-bold text-base-content">
          {{ formatValue(card.value) }}<span v-if="card.unit" class="ml-1 text-base font-medium text-base-content/60">{{ card.unit }}</span>
        </div>
      </div>
    </div>
  </ReportsSectionShell>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, required: true },
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
})

const trendIcon = (trend) => {
  if (trend === 'up') return 'lucide:trending-up'
  if (trend === 'down') return 'lucide:trending-down'
  return 'lucide:minus'
}

const trendClass = (trend) => {
  if (trend === 'up') return 'text-success'
  if (trend === 'down') return 'text-error'
  return 'text-base-content/40'
}

const formatValue = (value) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value)
  }
  return value
}
</script>
