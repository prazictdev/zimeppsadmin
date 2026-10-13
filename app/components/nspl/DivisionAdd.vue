<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:folder-plus" />
      <span class="hidden md:block">Add Division</span>
    </button>
    <dialog id="new_nspl_division_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Division</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_nspl_division_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <label class="fieldset">
            <span class="fieldset-legend">Category</span>
            <select
              v-model.number="form.category_id"
              :class="['select select-bordered w-full', errors.category_id ? 'select-error' : '']"
            >
              <option :value="null" disabled>Select category</option>
              <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.code }} · {{ c.name }}</option>
            </select>
            <label v-if="errors.category_id" class="label">
              <span class="label-text-alt text-red-600">{{ errors.category_id }}</span>
            </label>
          </label>

          <div class="grid grid-cols-3 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Code</span>
              <input
                v-model="form.code"
                type="text"
                placeholder="1"
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
                placeholder="e.g. New Light Motor Vehicles"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_nspl_division_modal.close()">Close</button>
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
const props = defineProps({ editionId: { type: Number, required: true } });
const store = useNsplStore();

const form = ref({ category_id: null, code: '', name: '', sort_order: 0 });
const errors = reactive({ category_id: '', code: '', name: '' });
const submitting = ref(false);

const openModal = async () => {
  await store.fetchCategories();
  document.getElementById('new_nspl_division_modal').showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await NsplDivisionSchema.validate(form.value, { abortEarly: false });
    const ok = await store.createDivision({ ...valid, edition_id: props.editionId });
    if (ok) {
      form.value = { category_id: null, code: '', name: '', sort_order: 0 };
      document.getElementById('new_nspl_division_modal').close();
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
