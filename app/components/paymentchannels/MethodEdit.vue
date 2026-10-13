<template>
  <div>
    <button class="btn btn-info btn-xs" @click="openModal">
      <Icon name="lucide:pencil" class="h-3.5 w-3.5" />
    </button>

    <dialog :id="`edit_paymentmethod_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Payment Method</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_paymentmethod_modal_${item.id}').close()`"
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
                placeholder="/paynowpayments"
                :class="['input input-bordered w-full', errors.url ? 'input-error' : '']"
              />
              <label v-if="errors.url" class="label">
                <span class="label-text-alt text-error">{{ errors.url }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Logo <span class="text-base-content/40 font-normal">(optional image)</span></span>
              <div v-if="existingLogo && !logoPreview" class="mb-2 flex items-center gap-2">
                <img :src="existingLogo" alt="Current logo" class="h-10 w-auto rounded border border-base-200 object-contain" />
                <span class="text-xs text-base-content/50">Current logo</span>
              </div>
              <input
                type="file"
                accept="image/*"
                class="file-input file-input-bordered w-full"
                @change="onLogoChange"
              />
              <div v-if="logoPreview" class="mt-2">
                <img :src="logoPreview" alt="New logo preview" class="h-12 w-auto rounded border border-base-200 object-contain" />
              </div>
            </label>

            <div class="flex items-center gap-3">
              <input
                :id="`edit_method_active_${item.id}`"
                v-model="form.is_active"
                type="checkbox"
                class="toggle toggle-success"
              />
              <label :for="`edit_method_active_${item.id}`" class="text-sm font-medium cursor-pointer">Active</label>
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_paymentmethod_modal_${item.id}').close()`"
            >
              Cancel
            </button>
            <button class="btn btn-success" type="submit" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              <span v-else>Update Method</span>
            </button>
          </div>
        </form>
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
const { presignAndUpload } = useS3Upload()
const toast = useToast()

const form = ref({ code: '', name: '', url: '', is_active: true })
const errors = reactive({ code: '', name: '', url: '' })
const submitting = ref(false)
const logoFile = ref(null)
const logoPreview = ref(null)
const existingLogo = ref(null)

const onLogoChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  logoFile.value = file
  logoPreview.value = URL.createObjectURL(file)
}

const openModal = async () => {
  const data = await store.findOne(props.item.id)
  if (data) {
    form.value = {
      code: data.code ?? '',
      name: data.name ?? '',
      url: data.url ?? '',
      is_active: data.is_active ?? true,
    }
    existingLogo.value = data.logo ?? null
    logoFile.value = null
    logoPreview.value = null
  }
  document.getElementById(`edit_paymentmethod_modal_${props.item.id}`).showModal()
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
    const ok = await store.update(props.item.id, props.channelId, payload)
    if (ok) {
      document.getElementById(`edit_paymentmethod_modal_${props.item.id}`).close()
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
