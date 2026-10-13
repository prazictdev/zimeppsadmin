<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal">
      <Icon name="lucide:trash-2" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete SBD Section</h3>
          <button class="btn btn-ghost btn-circle" @click="close">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Delete the section <span class="font-bold">{{ item.name }}</span> from the shared collection?
          Tenders that already added a copy keep their copy. This cannot be undone.
        </p>
        <div class="modal-action">
          <button class="btn" type="button" @click="close">Close</button>
          <button class="btn btn-error" :disabled="submitting" @click="handleDelete">
            <span v-if="submitting">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useSbdSectionStore();
const submitting = ref(false);

const modalId = computed(() => `delete_sbdsection_modal_${props.item.id}`);
const openModal = () => document.getElementById(modalId.value).showModal();
const close = () => document.getElementById(modalId.value).close();

const handleDelete = async () => {
  try {
    submitting.value = true;
    const ok = await store.remove(props.item.id);
    if (ok) close();
  } finally {
    submitting.value = false;
  }
};
</script>
