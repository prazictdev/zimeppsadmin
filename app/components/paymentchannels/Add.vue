<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Channel</span>
    </button>

    <dialog id="new_paymentchannel_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Payment Channel</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_paymentchannel_modal.close()">
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
                placeholder="e.g. online or bank_transfer"
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
                id="new_channel_active"
                v-model="form.is_active"
                type="checkbox"
                class="toggle toggle-success"
              />
              <label for="new_channel_active" class="text-sm font-medium cursor-pointer">Active</label>
            </div>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_paymentchannel_modal.close()">Cancel</button>
            <button class="btn btn-success" type="submit" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              <span v-else>Save Channel</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const store = usePaymentChannelStore()

const defaultForm = () => ({ code: '', name: '', is_active: true })
const form = ref(defaultForm())
const errors = reactive({ code: '', name: '' })
const submitting = ref(false)

const openModal = () => document.getElementById('new_paymentchannel_modal').showModal()

const resetForm = () => {
  form.value = defaultForm()
  errors.code = ''
  errors.name = ''
}

const handleSubmit = async () => {
  errors.code = ''
  errors.name = ''
  try {
    submitting.value = true
    const valid = await PaymentChannelSchema.validate(form.value, { abortEarly: false })
    const ok = await store.create(valid)
    if (ok) {
      resetForm()
      document.getElementById('new_paymentchannel_modal').close()
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
