<template><div><p class="text-xs text-base-content/45">{{ label }}</p><p class="mt-1 text-sm font-medium">{{ value || '—' }}</p></div></template>
<script setup>defineProps({ label: String, value: [String, Number] });</script>
