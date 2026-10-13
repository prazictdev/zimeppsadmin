<template>
  <div class="mt-2">
    <div v-if="!sections.length" class="text-xs text-base-content/50">
      No sections under this division yet.
    </div>
    <ul v-else class="ml-4 mt-1 space-y-1 text-sm">
      <li
        v-for="s in sections"
        :key="s.id"
        class="flex items-center justify-between gap-2 rounded-md border border-base-200/60 px-2 py-1"
      >
        <span>
          <span class="font-mono">{{ s.code }}</span>
          <span class="ml-2">{{ s.name }}</span>
          <span class="ml-2 text-xs text-base-content/50">{{ s.products_count ?? 0 }} products</span>
        </span>
        <span class="flex items-center gap-1">
          <NsplSectionEdit
            v-if="canEdit"
            :division-id="divisionId"
            :item="s"
          />
          <NsplSectionDelete
            v-if="canDelete"
            :division-id="divisionId"
            :item="s"
          />
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps({
  divisionId: { type: Number, required: true },
  editionId: { type: Number, required: true },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const helper = useNsplHelper();
const sections = ref([]);

const fetchSections = async () => {
  const { data } = await helper.getSectionsByDivision(props.divisionId);
  sections.value = data?.value?.data ?? [];
};

onMounted(fetchSections);

// Re-fetch when the parent edition's divisions change (e.g. after add/edit/delete).
const store = useNsplStore();
watch(() => store.divisions, fetchSections, { deep: true });
</script>
