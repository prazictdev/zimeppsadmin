<template>
  <ReportsSectionShell
    :narrative="narrative"
    :citations="citations"
    :instructions="instructions"
    :is-empty="!data.length"
  >
    <ol class="relative space-y-4 border-s border-base-300 ps-6">
      <li v-for="(milestone, index) in data" :key="index" class="relative">
        <span class="absolute -start-[1.7rem] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-base-100" />
        <div class="rounded-lg border border-base-200 bg-base-100 p-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-base-content">{{ milestone.label }}</span>
            <span v-if="milestone.status" class="badge badge-ghost badge-sm capitalize">
              {{ milestone.status }}
            </span>
          </div>
          <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-base-content/60">
            <span v-if="milestone.start_date" class="inline-flex items-center gap-1">
              <Icon name="lucide:calendar" class="h-3 w-3" />
              {{ formatDate(milestone.start_date) }}
              <template v-if="milestone.end_date"> → {{ formatDate(milestone.end_date) }}</template>
            </span>
            <span v-if="milestone.duration_days != null" class="inline-flex items-center gap-1">
              <Icon name="lucide:clock" class="h-3 w-3" />
              {{ milestone.duration_days }} day(s)
            </span>
          </div>
        </div>
      </li>
    </ol>
  </ReportsSectionShell>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, required: true },
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
})

const formatDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}
</script>
