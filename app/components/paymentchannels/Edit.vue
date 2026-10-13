<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:pencil" />
      <span class="hidden md:block">Edit</span>
    </button>

    <dialog :id="`edit_paymentchannel_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Payment Channel</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_paymentchannel_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Code</span>
              <input
                v-model="form.code"
                type="text"
                placeholder="e.g. online"
                :class="['input input-bordered w-full', errors.code ? 'input-error' : '']"
              />
              <p class="text-xs text-base-content/50 mt-1">Lowercase letters, numbers and underscores only.</p>
              <label v-if="errors.code" class="label">
                <span class="label-text-alt text-error">{{ errors.code }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Online Payment"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-error">{{ errors.name }}</span>
              </label>
            </label>

            <div class="flex items-center gap-3">
              <input
                :id="`edit_channel_active_${item.id}`"
                v-model="form.is_active"
                type="checkbox"
                class="toggle toggle-success"
              />
              <label :for="`edit_channel_active_${item.id}`" class="text-sm font-medium cursor-pointer">Active</label>
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_paymentchannel_modal_${item.id}').close()`"
            >
              Cancel
            </button>
            <button class="btn btn-success" type="submit" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              <span v-else>Update Channel</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } })
const store = usePaymentChannelStore()

const form = ref({ code: '', name: '', is_active: true })
const errors = reactive({ code: '', name: '' })
const submitting = ref(false)

const openModal = async () => {
  const data = await store.findOne(props.item.id)
  if (data) {
    form.value = { code: data.code ?? '', name: data.name ?? '', is_active: data.is_active ?? true }
  }
  document.getElementById(`edit_paymentchannel_modal_${props.item.id}`).showModal()
}

const handleSubmit = async () => {
  errors.code = ''
  errors.name = ''
  try {
    submitting.value = true
    const valid = await PaymentChannelSchema.validate(form.value, { abortEarly: false })
    const ok = await store.update(props.item.id, valid)
    if (ok) {
      document.getElementById(`edit_paymentchannel_modal_${props.item.id}`).close()
    }
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) errors[e.path] = e.message
      })
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message
    }
  } finally {
    submitting.value = false
  }
}
</script>
