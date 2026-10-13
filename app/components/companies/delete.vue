<template>
  <div>
    <button class="btn btn-error btn-sm ml-2" @click="openModal()">
      <Icon name="lucide:trash" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="`delete_company_modal_${company.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete customer</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('delete_company_modal_${company.id}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="form-control">
            <p>Are you sure you want to delete this customer: <span class="font-bold">{{ company?.name }}</span>?</p>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('delete_company_modal_${company.id}').close()`">Close</button>
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
const companyStore = useCompanyStore();
const props = defineProps({
  company: { type: Object, required: true },
});
const submitting = ref(false);

const openModal = () => {
  document.getElementById(`delete_company_modal_${props.company.id}`).showModal();
};

const handleSubmit = async () => {
  try {
    submitting.value = true;
    await companyStore.remove(props.company.id);
    document.getElementById(`delete_company_modal_${props.company.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
