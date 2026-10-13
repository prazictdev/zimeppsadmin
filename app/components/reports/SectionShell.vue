<template>
  <div class="space-y-3">
    <div v-if="isEmpty" class="flex items-center gap-2 rounded-lg border border-dashed border-base-300 bg-base-100 px-4 py-8 text-sm text-base-content/60">
      <Icon name="lucide:inbox" class="h-4 w-4" />
      <span>No data for this period.</span>
    </div>

    <div v-else>
      <slot />
    </div>

    <p v-if="narrative" class="text-sm leading-relaxed text-base-content/60">
      {{ narrative }}
    </p>

    <div v-if="showCitations" class="flex flex-wrap gap-2">
      <span
        v-for="(citation, index) in citations"
        :key="index"
        class="badge badge-outline badge-sm gap-1 text-xs"
        :title="citation.text"
      >
        <Icon name="lucide:scale" class="h-3 w-3" />
        {{ citation.law_section }}
      </span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
  instructions: { type: Object, default: () => ({}) },
  isEmpty: { type: Boolean, default: false },
})

const showCitations = computed(
  () => props.instructions?.show_law_ref && props.citations.length > 0,
)
</script>
