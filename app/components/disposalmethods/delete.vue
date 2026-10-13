<template>
  <div>
    <button class="btn btn-warning btn-sm" @click="openModal">
      <Icon name="lucide:archive" />
      <span class="hidden md:block">Archive</span>
    </button>
    <dialog :id="`archive_disposalmethod_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Archive Disposal Method</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('archive_disposalmethod_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Archive <span class="font-bold">{{ item.name }}</span>? It will no longer be selectable but
          historical references stay intact. You can restore it later by editing the status.
        </p>
        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('archive_disposalmethod_modal_${item.id}').close()`"
          >Close</button>
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
const store = useDisposalmethodStore();
const submitting = ref(false);

const openModal = () =>
  document.getElementById(`archive_disposalmethod_modal_${props.item.id}`).showModal();

const handleArchive = async () => {
  try {
    submitting.value = true;
    await store.archive(props.item.id);
    document.getElementById(`archive_disposalmethod_modal_${props.item.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
