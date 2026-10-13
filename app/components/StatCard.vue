<template>
  <div class="rounded-xl border p-4" :class="toneClass">
    <div class="flex items-start justify-between gap-3">
      <p class="text-xs font-semibold uppercase tracking-wide opacity-65">{{ label }}</p>
      <Icon :name="icon" class="h-4 w-4 opacity-60" />
    </div>
    <p class="mt-3 text-2xl font-bold tracking-tight">{{ value }}</p>
    <p class="mt-1 text-xs opacity-65">{{ note }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  note: { type: String, required: true },
  icon: { type: String, required: true },
  tone: { type: String, default: 'neutral' },
})

const toneClass = computed(() => ({
  success: 'border-success/25 bg-success/5 text-success',
  warning: 'border-warning/30 bg-warning/5 text-warning',
  error: 'border-error/25 bg-error/5 text-error',
  info: 'border-info/25 bg-info/5 text-info',
  neutral: 'border-base-300 bg-base-100 text-base-content',
})[props.tone] || 'border-base-300 bg-base-100 text-base-content')
</script>
