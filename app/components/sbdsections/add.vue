<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Section</span>
    </button>
    <dialog id="new_sbdsection_modal" class="modal">
      <div class="modal-box flex max-h-[90vh] w-full max-w-3xl flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold">New SBD Section</h3>
            <p class="text-xs text-base-content/60">
              A reusable section procuring entities can drop into a tender and then edit.
            </p>
          </div>
          <button class="btn btn-ghost btn-circle" onclick="new_sbdsection_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>

        <label class="fieldset">
          <span class="fieldset-legend">Collection name</span>
          <input
            v-model="form.name"
            type="text"
            placeholder="e.g. Standard payment milestones"
            :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
          />
          <label v-if="errors.name" class="label">
            <span class="label-text-alt text-red-600">{{ errors.name }}</span>
          </label>
        </label>

        <div class="min-h-0 flex-1 overflow-auto">
          <SbdsectionsEditor v-model="section" :title-error="errors.title" />
        </div>

        <div class="flex justify-end gap-2 border-t border-base-200 pt-3">
          <button class="btn" type="button" onclick="new_sbdsection_modal.close()">Close</button>
          <button class="btn btn-primary" type="button" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting">Saving...</span>
            <span v-else>Save section</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const store = useSbdSectionStore();

const submitting = ref(false);
const form = ref({ name: '' });
const section = ref(blankSbdSection());
const errors = reactive({ name: '', title: '' });

const openModal = () => document.getElementById('new_sbdsection_modal').showModal();

const reset = () => {
  form.value = { name: '' };
  section.value = blankSbdSection();
};

const handleSubmit = async () => {
  errors.name = '';
  errors.title = '';
  if (!form.value.name?.trim()) errors.name = 'Provide a collection name.';
  if (!section.value.title?.trim()) errors.title = 'Provide a section title.';
  if (errors.name || errors.title) return;

  submitting.value = true;
  const ok = await store.create({ name: form.value.name.trim(), body: sbdSectionToBody(section.value) });
  submitting.value = false;
  if (ok) {
    reset();
    document.getElementById('new_sbdsection_modal').close();
  }
};
</script>
