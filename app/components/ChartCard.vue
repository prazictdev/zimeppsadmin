<template>
  <div class="rounded-xl border border-base-200 bg-base-50 p-4">
    <h3 class="font-semibold">{{ title }}</h3>
    <p class="text-xs text-base-content/45">{{ subtitle }}</p>
    <div class="mt-3"><slot /></div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
})
</script>
