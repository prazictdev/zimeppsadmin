<template>
  <ReportsSectionShell
    :narrative="narrative"
    :citations="citations"
    :instructions="instructions"
    :is-empty="!data.length"
  >
    <ul class="space-y-2">
      <li
        v-for="(flag, index) in data"
        :key="index"
        class="flex items-start gap-3 rounded-lg border border-base-200 bg-base-100 p-3"
      >
        <span :class="['badge badge-sm shrink-0 capitalize', levelClass(flag.level)]">
          {{ flag.level }}
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm text-base-content">{{ flag.issue }}</p>
          <div class="mt-1 flex flex-wrap gap-2">
            <span v-if="flag.tender_id" class="badge badge-ghost badge-xs gap-1">
              <Icon name="lucide:file-text" class="h-3 w-3" />
              {{ flag.tender_id }}
            </span>
            <span
              v-if="instructions.show_law_ref && flag.law_ref"
              class="badge badge-outline badge-xs gap-1"
            >
              <Icon name="lucide:scale" class="h-3 w-3" />
              {{ flag.law_ref }}
            </span>
          </div>
        </div>
      </li>
    </ul>
  </ReportsSectionShell>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, required: true },
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
})

const levelClass = (level) => {
  if (level === 'high') return 'badge-error'
  if (level === 'medium') return 'badge-warning'
  return 'badge-info'
}
</script>
