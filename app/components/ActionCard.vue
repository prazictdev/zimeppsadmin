<template>
  <StatCard v-bind="$props" />
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  note: { type: String, required: true },
  icon: { type: String, required: true },
  tone: { type: String, default: 'neutral' },
})
</script>
