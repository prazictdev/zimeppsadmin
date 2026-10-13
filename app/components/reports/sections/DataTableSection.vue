<template>
  <ReportsSectionShell
    :narrative="narrative"
    :citations="citations"
    :instructions="instructions"
    :is-empty="!data.length"
  >
    <ReportsDataGrid :data="data" :instructions="instructions" />
  </ReportsSectionShell>
</template>

<script setup>
defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, required: true },
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
})
</script>
