<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Add Method</span>
    </button>

    <dialog :id="`new_paymentmethod_modal_${channelId}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Add Payment Method</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('new_paymentmethod_modal_${channelId}').close()`"
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
                placeholder="e.g. paynow or rtgs"
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
                placeholder="e.g. Paynow"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-error">{{ errors.name }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">URL <span class="text-base-content/40 font-normal">(optional)</span></span>
              <input
                v-model="form.url"
                type="text"
                placeholder="https://example.com"
                :class="['input input-bordered w-full', errors.url ? 'input-error' : '']"
              />
              <label v-if="errors.url" class="label">
                <span class="label-text-alt text-error">{{ errors.url }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Logo <span class="text-base-content/40 font-normal">(optional image)</span></span>
              <input
                type="file"
                accept="image/*"
                class="file-input file-input-bordered w-full"
                @change="onLogoChange"
              />
              <div v-if="logoPreview" class="mt-2">
                <img :src="logoPreview" alt="Logo preview" class="h-12 w-auto rounded border border-base-200 object-contain" />
              </div>
            </label>

            <div class="flex items-center gap-3">
              <input
                :id="`new_method_active_${channelId}`"
                v-model="form.is_active"
                type="checkbox"
                class="toggle toggle-success"
              />
              <label :for="`new_method_active_${channelId}`" class="text-sm font-medium cursor-pointer">Active</label>
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('new_paymentmethod_modal_${channelId}').close()`"
            >
              Cancel
            </button>
            <button class="btn btn-success" type="submit" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              <span v-else>Save Method</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ channelId: { type: Number, required: true } })
const store = usePaymentMethodStore()
const { presignAndUpload } = useS3Upload()
const toast = useToast()

const defaultForm = () => ({ code: '', name: '', url: '', is_active: true })
const form = ref(defaultForm())
const errors = reactive({ code: '', name: '', url: '' })
const submitting = ref(false)
const logoFile = ref(null)
const logoPreview = ref(null)

const openModal = () =>
  document.getElementById(`new_paymentmethod_modal_${props.channelId}`).showModal()

const onLogoChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const resetForm = () => {
  form.value = defaultForm()
  errors.code = ''
  errors.name = ''
  errors.url = ''
  logoFile.value = null
  logoPreview.value = null
}

const handleSubmit = async () => {
  errors.code = ''
  errors.name = ''
  errors.url = ''
  try {
    submitting.value = true
    const valid = await PaymentMethodSchema.validate(form.value, { abortEarly: false })

    let logoKey = null
    if (logoFile.value) {
      const { ok, key, error } = await presignAndUpload(logoFile.value, 'payment-method-logos')
      if (!ok) {
        toast.error(error ?? 'Logo upload failed.', { position: 'topRight', layout: 2 })
        return
      }
      logoKey = key
    }

    const payload = { ...valid, url: valid.url || null, ...(logoKey ? { logo: logoKey } : {}) }
    const ok = await store.create(props.channelId, payload)
    if (ok) {
      resetForm()
      document.getElementById(`new_paymentmethod_modal_${props.channelId}`).close()
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
