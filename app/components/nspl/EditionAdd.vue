<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Edition</span>
    </button>
    <dialog id="new_nspl_edition_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New NSPL Edition</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_nspl_edition_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <label class="fieldset">
            <span class="fieldset-legend">Period label</span>
            <input
              v-model="form.period"
              type="text"
              placeholder="e.g. January 2026"
              :class="['input input-bordered w-full', errors.period ? 'input-error' : '']"
            />
            <label v-if="errors.period" class="label">
              <span class="label-text-alt text-red-600">{{ errors.period }}</span>
            </label>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Year</span>
              <input
                v-model.number="form.year"
                type="number"
                placeholder="2026"
                :class="['input input-bordered w-full', errors.year ? 'input-error' : '']"
              />
              <label v-if="errors.year" class="label">
                <span class="label-text-alt text-red-600">{{ errors.year }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Quarter</span>
              <select
                v-model.number="form.quarter"
                :class="['select select-bordered w-full', errors.quarter ? 'select-error' : '']"
              >
                <option :value="1">Q1</option>
                <option :value="2">Q2</option>
                <option :value="3">Q3</option>
                <option :value="4">Q4</option>
              </select>
              <label v-if="errors.quarter" class="label">
                <span class="label-text-alt text-red-600">{{ errors.quarter }}</span>
              </label>
            </label>
          </div>

          <label class="fieldset">
            <span class="fieldset-legend">Notes (optional)</span>
            <textarea
              v-model="form.notes"
              rows="3"
              :class="['textarea textarea-bordered w-full', errors.notes ? 'textarea-error' : '']"
            ></textarea>
          </label>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_nspl_edition_modal.close()">Close</button>
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
const store = useNsplStore();

const form = ref({ period: '', year: new Date().getFullYear(), quarter: 1, notes: '' });
const errors = reactive({ period: '', year: '', quarter: '', notes: '' });
const submitting = ref(false);

const openModal = () => document.getElementById('new_nspl_edition_modal').showModal();

const resetForm = () => {
  form.value = { period: '', year: new Date().getFullYear(), quarter: 1, notes: '' };
  Object.keys(errors).forEach((k) => (errors[k] = ''));
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await NsplEditionSchema.validate(form.value, { abortEarly: false });
    const created = await store.createEdition(valid);
    if (created) {
      resetForm();
      document.getElementById('new_nspl_edition_modal').close();
    }
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
