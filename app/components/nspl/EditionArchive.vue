<template>
  <div>
    <button class="btn btn-warning btn-sm" @click="openModal">
      <Icon name="lucide:archive" />
      <span class="hidden md:block">Archive</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Archive NSPL Edition</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Archive <span class="font-bold">{{ item.period }}</span>?
          The hierarchy is preserved but the edition can no longer be edited.
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
const store = useNsplStore();
const submitting = ref(false);

const modalId = computed(() => `archive_nspl_edition_modal_${props.item.id}`);

const openModal = () => document.getElementById(modalId.value).showModal();

const handleArchive = async () => {
  try {
    submitting.value = true;
    const ok = await store.archiveEdition(props.item.id);
    if (ok) document.getElementById(modalId.value).close();
  } finally {
    submitting.value = false;
  }
};
</script>
