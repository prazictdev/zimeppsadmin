<template>
  <div>
    <button
      class="btn btn-error btn-xs ml-2"
      @click="openModal()"
    >
      <Icon name="lucide:trash" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="`delete_system_submodule_modal_${systemsubmodule.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete system submodule</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('delete_system_submodule_modal_${systemsubmodule.id}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="form-control">
            <p>Are you sure you want to delete this system submodule: <span class="font-bold">{{ systemsubmodule?.name }}</span>?</p>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('delete_system_submodule_modal_${systemsubmodule.id}').close()`">Close</button>
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
const emit = defineEmits(['refresh']);
const systemsubmoduleStore = useSystemsubmoduleStore();
const props = defineProps({
  systemsubmodule: {
    type: Object,
    required: true,
  },
});

const submitting = ref(false);

const openModal = () => {
  document.getElementById(`delete_system_submodule_modal_${props.systemsubmodule.id}`).showModal();
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    const ok = await systemsubmoduleStore.remove(props.systemsubmodule.id);
    if (ok) {
      document.getElementById(`delete_system_submodule_modal_${props.systemsubmodule.id}`).close();
      emit('refresh');
    }
  } catch (err) {
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
