<template>
  <div>
    <button class="btn btn-error btn-xs" @click="openModal">
      <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
    </button>

    <dialog :id="`delete_paymentmethod_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Payment Method</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_paymentmethod_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <p class="py-4">
          Are you sure you want to delete <strong>{{ item.name }}</strong>?
          This action cannot be undone.
        </p>

        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('delete_paymentmethod_modal_${item.id}').close()`"
          >
            Cancel
          </button>
          <button class="btn btn-error" :disabled="submitting" @click="handleDelete">
            <span v-if="submitting" class="loading loading-spinner loading-xs" />
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
  channelId: { type: Number, required: true },
})
const store = usePaymentMethodStore()
const submitting = ref(false)

const openModal = () =>
  document.getElementById(`delete_paymentmethod_modal_${props.item.id}`).showModal()

const handleDelete = async () => {
  try {
    submitting.value = true
    const ok = await store.remove(props.item.id, props.channelId)
    if (ok) {
      document.getElementById(`delete_paymentmethod_modal_${props.item.id}`).close()
    }
  } finally {
    submitting.value = false
  }
}
</script>
