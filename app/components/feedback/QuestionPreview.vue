<template><div class="space-y-2"><div v-for="(question, index) in questions" :key="question.uuid || index" class="rounded-box border border-base-300 bg-base-100 p-4"><div class="flex items-start gap-3"><span class="badge badge-ghost">{{ index + 1 }}</span><div><p class="font-medium">{{ question.prompt }} <span v-if="question.required" class="text-error">*</span></p><p v-if="question.help_text" class="mt-1 text-xs text-base-content/50">{{ question.help_text }}</p><span class="badge badge-outline badge-sm mt-2">{{ label(question.type) }}</span></div></div></div></div></template>
<script setup>
defineProps({ questions: { type: Array, required: true } })
const label = value => String(value || '').toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
</script>
