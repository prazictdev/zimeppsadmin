<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Procurement Method</span>
    </button>
    <dialog id="new_procurementmethod_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Procurement Method</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_procurementmethod_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Code</span>
              <input
                type="text"
                v-model="form.code"
                placeholder="e.g. PM-001"
                :class="['input input-bordered w-full', errors.code ? 'input-error' : '']"
              />
              <label v-if="errors.code" class="label">
                <span class="label-text-alt text-red-600">{{ errors.code }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                type="text"
                v-model="form.name"
                placeholder="e.g. Open Tendering"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
            <label class="cursor-pointer label justify-start gap-3">
              <input type="checkbox" v-model="form.can_request_bidbond" class="checkbox checkbox-sm" />
              <span class="label-text">PE can request bid bond when this method is used</span>
            </label>
            <label class="cursor-pointer label justify-start gap-3">
              <input type="checkbox" v-model="form.subject_to_spoc" class="checkbox checkbox-sm" />
              <span class="label-text">Procurements using this method are subject to SPOC oversight</span>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" onclick="new_procurementmethod_modal.close()">Close</button>
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
const store = useProcurementMethodStore();

const form = ref({ code: '', name: '', can_request_bidbond: false, subject_to_spoc: false });
const errors = reactive({ code: '', name: '' });
const submitting = ref(false);

const openModal = () => document.getElementById('new_procurementmethod_modal').showModal();

const resetForm = () => { form.value = { code: '', name: '', can_request_bidbond: false, subject_to_spoc: false }; errors.code = ''; errors.name = ''; };

const handleSubmit = async () => {
  errors.code = '';
  errors.name = '';
  try {
    submitting.value = true;
    const valid = await ProcurementMethodSchema.validate(form.value, { abortEarly: false });
    await store.create(valid);
    resetForm();
    document.getElementById('new_procurementmethod_modal').close();
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
