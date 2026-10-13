<template>
  <div>
    <button  class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_document_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Document</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_document_modal_${item.id}').close()`"
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
                placeholder="e.g. Certificate of Incorporation"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Document Type <span class="font-normal text-base-content/40">(optional)</span></span>
              <select
                v-model="form.documenttype_id"
                :class="['select select-bordered w-full', errors.documenttype_id ? 'select-error' : '']"
              >
                <option :value="null">— Select type —</option>
                <option v-for="t in doctypes" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <label v-if="errors.documenttype_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.documenttype_id }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">AI Verification Instructions <span class="font-normal text-base-content/40">(optional)</span></span>
              <textarea
                v-model="form.instructions"
                rows="4"
                placeholder="Describe what the AI agent should check or verify when reviewing this document…"
                :class="['textarea textarea-bordered w-full text-sm', errors.instructions ? 'textarea-error' : '']"
              />
              <label v-if="errors.instructions" class="label">
                <span class="label-text-alt text-red-600">{{ errors.instructions }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_document_modal_${item.id}').close()`"
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
const store = useDocumentStore();
const form = ref({ name: '', instructions: '', documenttype_id: null });
const errors = reactive({ name: '', instructions: '', documenttype_id: '' });
const doctypes = ref([]);

onMounted(async () => {
  const { getDocumentTypes } = useDocumentTypeHelper();
  const { data } = await getDocumentTypes();
  doctypes.value = data?.value?.data ?? [];
});
const submitting = ref(false);

const openModal = async () => {
  const data = await store.findOne(props.item.id);
  if (data) form.value = { name: data.name ?? '', instructions: data.instructions ?? '', documenttype_id: data.documenttype_id ?? null };
  document.getElementById(`edit_document_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  errors.name = '';
  try {
    submitting.value = true;
    const valid = await DocumentSchema.validate(form.value, { abortEarly: false });
    await store.update(props.item.id, valid);
    document.getElementById(`edit_document_modal_${props.item.id}`).close();
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
