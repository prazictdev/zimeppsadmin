<template>
  <div>
    <button class="btn btn-success" onclick="new_companyindustry_modal.showModal()">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Industry</span>
    </button>
    <dialog id="new_companyindustry_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Company Industry</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_companyindustry_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="mt-3">
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                type="text"
                v-model="form.name"
                placeholder="e.g. Mining"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" onclick="new_companyindustry_modal.close()">
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
const store = useCompanyIndustryStore();
const form = ref({ name: '' });
const errors = reactive({ name: '' });
const submitting = ref(false);

const resetForm = () => {
  form.value = { name: '' };
  errors.name = '';
};

const handleSubmit = async () => {
  errors.name = '';
  try {
    submitting.value = true;
    const validData = await CompanyIndustrySchema.validate(form.value, { abortEarly: false });
    await store.create(validData);
    resetForm();
    document.getElementById('new_companyindustry_modal').close();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) {
          errors[e.path] = e.message;
        }
      });
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    }
  } finally {
    submitting.value = false;
  }
};
</script>
