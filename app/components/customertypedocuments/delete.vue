<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal">
      <Icon name="lucide:trash" />
      <span class="hidden md:block">Remove</span>
    </button>
    <dialog :id="`delete_customertypedocument_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Remove Document Assignment</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_customertypedocument_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Remove <span class="font-bold">{{ item.document?.name ?? 'this document' }}</span>
          from <span class="font-bold">{{ item.customertype?.name ?? 'this customer type' }}</span>
          <span class="badge badge-sm ml-1" :class="item.locality === 'local' ? 'badge-success' : 'badge-info'">
            {{ item.locality === 'local' ? 'Local' : 'Foreign' }}
          </span>?
        </p>
        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('delete_customertypedocument_modal_${item.id}').close()`"
          >Close</button>
          <button class="btn btn-error" :disabled="submitting" @click="handleDelete">
            <span v-if="submitting">Removing...</span>
            <span v-else>Remove</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useCustomerTypeDocumentStore();
const submitting = ref(false);

const openModal = () =>
  document.getElementById(`delete_customertypedocument_modal_${props.item.id}`).showModal();

const handleDelete = async () => {
  try {
    submitting.value = true;
    await store.remove(props.item.id);
    document.getElementById(`delete_customertypedocument_modal_${props.item.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
