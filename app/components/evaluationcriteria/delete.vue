<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal">
      <Icon name="lucide:trash-2" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="`delete_evaluationcriterion_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Evaluation Criterion</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_evaluationcriterion_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Delete <span class="font-bold">{{ item.name }}</span>? This action cannot be undone.
        </p>
        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('delete_evaluationcriterion_modal_${item.id}').close()`"
          >Close</button>
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
const store = useEvaluationcriterionStore();
const submitting = ref(false);

const openModal = () =>
  document.getElementById(`delete_evaluationcriterion_modal_${props.item.id}`).showModal();

const handleDelete = async () => {
  try {
    submitting.value = true;
    await store.remove(props.item.id);
    document.getElementById(`delete_evaluationcriterion_modal_${props.item.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
