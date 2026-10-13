<template>
  <div>
    <button class="btn btn-success btn-xs" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Add Section</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Section under {{ division.code }} · {{ division.name }}</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <div class="grid grid-cols-3 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Code</span>
              <input
                v-model="form.code"
                type="text"
                placeholder="1.1"
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
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>

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
const props = defineProps({
  editionId: { type: Number, required: true },
  division: { type: Object, required: true },
});
const store = useNsplStore();

const modalId = computed(() => `new_nspl_section_modal_${props.division.id}`);

const form = ref({ code: '', name: '' });
const errors = reactive({ code: '', name: '' });
const submitting = ref(false);

const openModal = () => document.getElementById(modalId.value).showModal();

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const payload = { ...form.value, division_id: props.division.id };
    const valid = await NsplSectionSchema.validate(payload, { abortEarly: false });
    const ok = await store.createSection({ ...valid, edition_id: props.editionId });
    if (ok) {
      // Bump divisions counters by re-fetching divisions for the edition.
      await store.fetchDivisions(props.editionId);
      form.value = { code: '', name: '' };
      document.getElementById(modalId.value).close();
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
