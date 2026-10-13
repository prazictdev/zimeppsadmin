<template>
  <div>
    <button class="btn btn-info btn-xs" @click="openModal">
      <Icon name="lucide:edit" />
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Product</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <div class="grid grid-cols-3 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Code</span>
              <input
                v-model="form.code"
                type="text"
                :class="['input input-bordered w-full', errors.code ? 'input-error' : '']"
              />
              <label v-if="errors.code" class="label">
                <span class="label-text-alt text-red-600">{{ errors.code }}</span>
              </label>
            </label>

            <label class="fieldset col-span-2">
              <span class="fieldset-legend">Name</span>
              <input
                v-model="form.name"
                type="text"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>

          <label class="fieldset">
            <span class="fieldset-legend">Specifications</span>
            <textarea
              v-model="form.specifications"
              rows="3"
              :class="['textarea textarea-bordered w-full', errors.specifications ? 'textarea-error' : '']"
            ></textarea>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">USD price (leave blank for "—")</span>
              <input
                v-model="form.usd_price"
                type="number"
                step="0.01"
                min="0"
                :class="['input input-bordered w-full', errors.usd_price ? 'input-error' : '']"
              />
              <label v-if="errors.usd_price" class="label">
                <span class="label-text-alt text-red-600">{{ errors.usd_price }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Branded?</span>
              <label class="label cursor-pointer justify-start gap-2">
                <input v-model="form.is_branded" type="checkbox" class="toggle toggle-sm" />
                <span class="label-text">Mark as branded</span>
              </label>
            </label>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting">Saving...</span>
              <span v-else>Save</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  editionId: { type: Number, required: true },
  item: { type: Object, required: true },
});
const store = useNsplStore();

const modalId = computed(() => `edit_nspl_product_modal_${props.item.id}`);

const form = ref({ section_id: null, code: '', name: '', specifications: '', usd_price: null, is_branded: false });
const errors = reactive({ section_id: '', code: '', name: '', specifications: '', usd_price: '' });
const submitting = ref(false);

const openModal = async () => {
  const fresh = await store.findProduct(props.item.id);
  const source = fresh ?? props.item;
  form.value = {
    section_id: source.section_id,
    code: source.code,
    name: source.name,
    specifications: source.specifications ?? '',
    usd_price: source.usd_price === null ? null : Number(source.usd_price),
    is_branded: !!source.is_branded,
  };
  document.getElementById(modalId.value).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await NsplProductSchema.validate(form.value, { abortEarly: false });
    const ok = await store.updateProduct(props.item.id, valid, props.editionId);
    if (ok) document.getElementById(modalId.value).close();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) errors[e.path] = e.message;
      });
    }
  } finally {
    submitting.value = false;
  }
};
</script>
