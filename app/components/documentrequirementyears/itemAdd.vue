<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Add Document</span>
    </button>
    <dialog id="new_dr_year_item_modal" class="modal">
      <div class="modal-box max-w-xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Add Required Document</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_dr_year_item_modal.close()">
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
              <option :value="null" disabled>Select document</option>
              <option v-for="d in store.documents" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <label v-if="errors.document_id" class="label">
              <span class="label-text-alt text-red-600">{{ errors.document_id }}</span>
            </label>
          </label>

          <label class="fieldset">
            <span class="fieldset-legend">Notes (optional)</span>
            <textarea
              v-model="form.notes"
              rows="2"
              :class="['textarea textarea-bordered w-full', errors.notes ? 'textarea-error' : '']"
            ></textarea>
          </label>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_dr_year_item_modal.close()">Close</button>
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
const props = defineProps({ yearId: { type: Number, required: true } });
const store = useDocumentRequirementYearStore();

const form = ref({ document_id: null, notes: '' });
const errors = reactive({ document_id: '', notes: '' });
const submitting = ref(false);

const openModal = async () => {
  await store.fetchLookups();
  document.getElementById('new_dr_year_item_modal').showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await DocumentRequirementYearItemSchema.validate(form.value, { abortEarly: false });
    const ok = await store.createItem({ ...valid, documentrequirementyear_id: props.yearId }, props.yearId);
    if (ok) {
      form.value = { document_id: null, notes: '' };
      document.getElementById('new_dr_year_item_modal').close();
    }
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
