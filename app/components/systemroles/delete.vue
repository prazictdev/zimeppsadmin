<template>
  <div>
    <button class="btn btn-error btn-sm ml-2" @click="openModal()">
      <Icon name="lucide:trash" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="`delete_system_role_modal_${systemrole.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete system role</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('delete_system_role_modal_${systemrole.id}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="form-control">
            <p>Are you sure you want to delete this role: <span class="font-bold">{{ systemrole?.name }}</span>?</p>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('delete_system_role_modal_${systemrole.id}').close()`">Close</button>
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
const systemroleStore = useSystemroleStore();
const props = defineProps({
  systemrole: { type: Object, required: true },
});
const submitting = ref(false);

const openModal = () => {
  document.getElementById(`delete_system_role_modal_${props.systemrole.id}`).showModal();
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    await systemroleStore.remove(props.systemrole.id);
    document.getElementById(`delete_system_role_modal_${props.systemrole.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
