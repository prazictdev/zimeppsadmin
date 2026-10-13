<template>
  <div>
    <button class="btn btn-warning btn-sm" @click="openModal">
      <Icon name="lucide:archive" />
      <span class="hidden md:block">Archive</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Archive Year {{ item.year }}</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Archive document requirements for <span class="font-bold">{{ item.year }}</span>?
          The data is preserved but the year is no longer editable.
        </p>
        <div class="modal-action">
          <button class="btn" type="button" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
          <button class="btn btn-warning" :disabled="submitting" @click="handleArchive">
            <span v-if="submitting">Archiving...</span>
            <span v-else>Archive</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useDocumentRequirementYearStore();
const submitting = ref(false);

const modalId = computed(() => `archive_dr_year_modal_${props.item.id}`);
const openModal = () => document.getElementById(modalId.value).showModal();

const handleArchive = async () => {
  try {
    submitting.value = true;
    const ok = await store.archiveYear(props.item.id);
    if (ok) document.getElementById(modalId.value).close();
  } finally {
    submitting.value = false;
  }
};
</script>
