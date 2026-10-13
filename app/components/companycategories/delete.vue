<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal()">
      <Icon name="lucide:trash" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="`delete_companycategory_modal_${category.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Company Category</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_companycategory_modal_${category.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <p>
            Are you sure you want to delete category:
            <span class="font-bold">{{ category?.name }}</span>?
          </p>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('delete_companycategory_modal_${category.id}').close()`"
            >
              Close
            </button>
            <button class="btn btn-error" type="submit" :disabled="submitting">
              <span v-if="submitting">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>
<script setup>
const store = useCompanyCategoryStore();
const props = defineProps({
  category: { type: Object, required: true },
});
const submitting = ref(false);

const openModal = () => {
  document.getElementById(`delete_companycategory_modal_${props.category.id}`).showModal();
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    await store.remove(props.category.id);
    document.getElementById(`delete_companycategory_modal_${props.category.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
