<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal">
      <Icon name="lucide:trash-2" />
      <span class="hidden md:block">Delete</span>
    </button>

    <dialog :id="`delete_paymentchannel_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Payment Channel</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_paymentchannel_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="py-4 space-y-2">
          <p>Are you sure you want to delete <strong>{{ item.name }}</strong>?</p>
          <p class="text-sm text-error">
            This will also delete all payment methods under this channel. This action cannot be undone.
          </p>
        </div>

        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('delete_paymentchannel_modal_${item.id}').close()`"
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
const props = defineProps({ item: { type: Object, required: true } })
const store = usePaymentChannelStore()
const submitting = ref(false)

const openModal = () =>
  document.getElementById(`delete_paymentchannel_modal_${props.item.id}`).showModal()

const handleDelete = async () => {
  try {
    submitting.value = true
    const ok = await store.remove(props.item.id)
    if (ok) {
      document.getElementById(`delete_paymentchannel_modal_${props.item.id}`).close()
    }
  } finally {
    submitting.value = false
  }
}
</script>
