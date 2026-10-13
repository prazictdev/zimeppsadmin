<template>
  <div>
    <button  class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Customer Type</span>
    </button>
    <dialog id="new_customertype_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Customer Type</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_customertype_modal.close()">
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
                placeholder="e.g. CT-001"
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
                placeholder="e.g. Individual"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" onclick="new_customertype_modal.close()">Close</button>
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
const store = useCustomerTypeStore();

const form = ref({ code: '', name: '' });
const errors = reactive({ code: '', name: '' });
const submitting = ref(false);

const openModal = () => document.getElementById('new_customertype_modal').showModal();

const resetForm = () => { form.value = { code: '', name: '' }; errors.code = ''; errors.name = ''; };

const handleSubmit = async () => {
  errors.code = '';
  errors.name = '';
  try {
    submitting.value = true;
    const valid = await CustomerTypeSchema.validate(form.value, { abortEarly: false });
    await store.create(valid);
    resetForm();
    document.getElementById('new_customertype_modal').close();
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
