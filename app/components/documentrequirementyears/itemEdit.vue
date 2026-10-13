<template>
  <div>
    <button class="btn btn-info btn-xs" @click="openModal">
      <Icon name="lucide:edit" />
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box max-w-xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Required Document</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <label class="fieldset">
            <span class="fieldset-legend">Document</span>
            <select
              v-model.number="form.document_id"
              :class="['select select-bordered w-full', errors.document_id ? 'select-error' : '']"
            >
              <option v-for="d in store.documents" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <label v-if="errors.document_id" class="label">
              <span class="label-text-alt text-red-600">{{ errors.document_id }}</span>
            </label>
          </label>

          <label class="fieldset">
            <span class="fieldset-legend">Notes</span>
            <textarea
              v-model="form.notes"
              rows="2"
              :class="['textarea textarea-bordered w-full', errors.notes ? 'textarea-error' : '']"
            ></textarea>
          </label>

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
  yearId: { type: Number, required: true },
  item: { type: Object, required: true },
});
const store = useDocumentRequirementYearStore();

const modalId = computed(() => `edit_dr_year_item_modal_${props.item.id}`);

const form = ref({ document_id: null, notes: '' });
const errors = reactive({ document_id: '', notes: '' });
const submitting = ref(false);

const openModal = async () => {
  await store.fetchLookups();
  form.value = {
    document_id: props.item.document_id,
    notes: props.item.notes ?? '',
  };
  document.getElementById(modalId.value).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await DocumentRequirementYearItemSchema.validate(form.value, { abortEarly: false });
    const ok = await store.updateItem(
      props.item.id,
      { ...valid, documentrequirementyear_id: props.yearId },
      props.yearId,
    );
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
