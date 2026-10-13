<template>
  <div>
    <button class="btn btn-outline btn-sm" @click="openModal">
      <Icon name="lucide:copy" />
      <span class="hidden md:block">Clone</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Clone Year {{ item.year }}</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="mt-1 text-sm text-base-content/70">
          Copy all document requirement items from <span class="font-bold">{{ item.year }}</span>
          into a new DRAFT year you can then adjust.
        </p>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <label class="fieldset">
            <span class="fieldset-legend">New year</span>
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
            <span class="fieldset-legend">Label (optional)</span>
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

          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting">Cloning...</span>
              <span v-else>Clone</span>
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

const modalId = computed(() => `clone_dr_year_modal_${props.item.id}`);

const form = ref({ year: 0, label: '', effective_from: '', effective_to: '' });
const errors = reactive({ year: '', label: '', effective_from: '', effective_to: '' });
const submitting = ref(false);

const openModal = () => {
  form.value = {
    year: (props.item.year ?? new Date().getFullYear()) + 1,
    label: '',
    effective_from: '',
    effective_to: '',
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
    const cloned = await store.cloneYear(props.item.id, cleaned);
    if (cloned) document.getElementById(modalId.value).close();
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
