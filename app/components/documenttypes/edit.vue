<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_documenttype_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Document Type</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_documenttype_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 space-y-3">
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                type="text"
                v-model="form.name"
                placeholder="e.g. Tax Certificate"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_documenttype_modal_${item.id}').close()`"
            >
              Close
            </button>
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
const props = defineProps({ item: { type: Object, required: true } });
const store = useDocumenttypeStore();
const form = ref({ name: '' });
const errors = reactive({ name: '' });
const submitting = ref(false);

const openModal = async () => {
  const data = await store.findOne(props.item.id);
  if (data) form.value = { name: data.name ?? '' };
  document.getElementById(`edit_documenttype_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  errors.name = '';
  try {
    submitting.value = true;
    const valid = await DocumentTypeSchema.validate(form.value, { abortEarly: false });
    await store.update(props.item.id, valid);
    document.getElementById(`edit_documenttype_modal_${props.item.id}`).close();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) errors[e.path] = e.message;
      });
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    }
  } finally {
    submitting.value = false;
  }
};
</script>
