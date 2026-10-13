<template>
  <div>
    <button class="btn btn-error btn-xs" @click="openModal">
      <Icon name="lucide:trash-2" />
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Product</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Delete <span class="font-mono">{{ item.code }}</span> · <span class="font-bold">{{ item.name }}</span>?
        </p>
        <div class="modal-action">
          <button class="btn" type="button" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
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
const props = defineProps({
  editionId: { type: Number, required: true },
  item: { type: Object, required: true },
});
const store = useNsplStore();
const submitting = ref(false);

const modalId = computed(() => `delete_nspl_product_modal_${props.item.id}`);
const openModal = () => document.getElementById(modalId.value).showModal();

const handleDelete = async () => {
  try {
    submitting.value = true;
    const ok = await store.deleteProduct(props.item.id, props.editionId);
    if (ok) document.getElementById(modalId.value).close();
  } finally {
    submitting.value = false;
  }
};
</script>
