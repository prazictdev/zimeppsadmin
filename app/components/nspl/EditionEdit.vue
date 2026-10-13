<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit NSPL Edition</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <label class="fieldset">
            <span class="fieldset-legend">Period label</span>
            <input
              v-model="form.period"
              type="text"
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
            <span class="fieldset-legend">Notes</span>
            <textarea
              v-model="form.notes"
              rows="3"
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
const props = defineProps({ item: { type: Object, required: true } });
const store = useNsplStore();

const modalId = computed(() => `edit_nspl_edition_modal_${props.item.id}`);

const form = ref({ period: '', year: 0, quarter: 1, notes: '' });
const errors = reactive({ period: '', year: '', quarter: '', notes: '' });
const submitting = ref(false);

const openModal = () => {
  form.value = {
    period: props.item.period ?? '',
    year: props.item.year ?? new Date().getFullYear(),
    quarter: props.item.quarter ?? 1,
    notes: props.item.notes ?? '',
  };
  document.getElementById(modalId.value).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await NsplEditionSchema.validate(form.value, { abortEarly: false });
    const ok = await store.updateEdition(props.item.id, valid);
    if (ok) document.getElementById(modalId.value).close();
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
