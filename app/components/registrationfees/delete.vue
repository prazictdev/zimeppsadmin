<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal">
      <Icon name="lucide:trash" />
    </button>
    <dialog :id="`delete_registrationfee_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Registration Fee</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_registrationfee_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Are you sure you want to delete the
          <span class="font-bold capitalize">{{ item.locality }}</span> registration fee
          of <span class="font-bold">{{ item.currency?.code }} {{ formatNumber(item.fee) }}</span>?
        </p>
        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('delete_registrationfee_modal_${item.id}').close()`"
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
const props = defineProps({
  item: { type: Object, required: true },
  suppliergroupId: { type: Number, required: true },
});

const store = useRegistrationFeeStore();
const submitting = ref(false);

const openModal = () =>
  document.getElementById(`delete_registrationfee_modal_${props.item.id}`).showModal();

const formatNumber = (value) =>
  Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const handleDelete = async () => {
  try {
    submitting.value = true;
    await store.remove(props.item.id, props.suppliergroupId);
    document.getElementById(`delete_registrationfee_modal_${props.item.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
