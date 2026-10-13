<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal()">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_companysubcategory_modal_${subcategory.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Company Subcategory</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_companysubcategory_modal_${subcategory.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Category</span>
              <select
                v-model="form.companycategory_id"
                :class="['select select-bordered w-full', errors.companycategory_id ? 'select-error' : '']"
              >
                <option value="" disabled>Select category</option>
                <option
                  v-for="cat in categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </option>
              </select>
              <label v-if="errors.companycategory_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.companycategory_id }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                type="text"
                v-model="form.name"
                placeholder="e.g. Textiles"
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
              :onclick="`document.getElementById('edit_companysubcategory_modal_${subcategory.id}').close()`"
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
const store = useCompanySubcategoryStore();
const props = defineProps({
  subcategory: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
});

const form = ref({ companycategory_id: '', name: '' });
const errors = reactive({ companycategory_id: '', name: '' });
const submitting = ref(false);

const openModal = async () => {
  const data = await store.findOne(props.subcategory.id);
  if (data) {
    form.value = {
      companycategory_id: data.companycategory_id ?? data.companycategory?.id ?? '',
      name: data.name ?? '',
    };
  }
  document.getElementById(`edit_companysubcategory_modal_${props.subcategory.id}`).showModal();
};

const handleSubmit = async () => {
  errors.companycategory_id = '';
  errors.name = '';
  try {
    submitting.value = true;
    const validData = await CompanySubcategorySchema.validate(form.value, { abortEarly: false });
    await store.update(props.subcategory.id, validData);
    document.getElementById(`edit_companysubcategory_modal_${props.subcategory.id}`).close();
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
