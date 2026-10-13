<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Year {{ item.year }}</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
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
            <span class="fieldset-legend">Label</span>
            <input
              v-model="form.label"
              type="text"
              :class="['input input-bordered w-full', errors.label ? 'input-error' : '']"
            />
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Effective from</span>
              <input
                v-model="form.effective_from"
                type="date"
                :class="['input input-bordered w-full', errors.effective_from ? 'input-error' : '']"
              />
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Effective to</span>
              <input
                v-model="form.effective_to"
                type="date"
                :class="['input input-bordered w-full', errors.effective_to ? 'input-error' : '']"
              />
              <label v-if="errors.effective_to" class="label">
                <span class="label-text-alt text-red-600">{{ errors.effective_to }}</span>
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
const store = useDocumentRequirementYearStore();

const modalId = computed(() => `edit_dr_year_modal_${props.item.id}`);

const isoDate = (v) => (v ? String(v).slice(0, 10) : '');

const form = ref({ year: 0, label: '', effective_from: '', effective_to: '', notes: '' });
const errors = reactive({ year: '', label: '', effective_from: '', effective_to: '', notes: '' });
const submitting = ref(false);

const openModal = () => {
  form.value = {
    year: props.item.year,
    label: props.item.label ?? '',
    effective_from: isoDate(props.item.effective_from),
    effective_to: isoDate(props.item.effective_to),
    notes: props.item.notes ?? '',
  };
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  document.getElementById(modalId.value).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await DocumentRequirementYearSchema.validate(form.value, { abortEarly: false });
    const cleaned = {
      ...valid,
      effective_from: valid.effective_from || null,
      effective_to: valid.effective_to || null,
    };
    const ok = await store.updateYear(props.item.id, cleaned);
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
