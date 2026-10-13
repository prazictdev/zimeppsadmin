<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:pencil" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box flex max-h-[90vh] w-full max-w-3xl flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold">Edit SBD Section</h3>
            <p class="text-xs text-base-content/60">Changes apply to new tenders that add this section.</p>
          </div>
          <button class="btn btn-ghost btn-circle" @click="close">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="fieldset">
            <span class="fieldset-legend">Collection name</span>
            <input
              v-model="form.name"
              type="text"
              :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
            />
            <label v-if="errors.name" class="label">
              <span class="label-text-alt text-red-600">{{ errors.name }}</span>
            </label>
          </label>
          <label class="fieldset">
            <span class="fieldset-legend">Status</span>
            <select v-model="form.status" class="select select-bordered w-full">
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
        </div>

        <div class="min-h-0 flex-1 overflow-auto">
          <SbdsectionsEditor v-model="section" :title-error="errors.title" />
        </div>

        <div class="flex justify-end gap-2 border-t border-base-200 pt-3">
          <button class="btn" type="button" @click="close">Close</button>
          <button class="btn btn-primary" type="button" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting">Saving...</span>
            <span v-else>Save changes</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useSbdSectionStore();

const submitting = ref(false);
const modalId = computed(() => `edit_sbdsection_modal_${props.item.id}`);
const form = ref({ name: '', status: 'ACTIVE' });
const section = ref(blankSbdSection());
const errors = reactive({ name: '', title: '' });

const hydrate = () => {
  form.value = { name: props.item.name ?? '', status: props.item.status ?? 'ACTIVE' };
  section.value = toEditableSbdSection(props.item.body);
};

const openModal = () => {
  hydrate();
  document.getElementById(modalId.value).showModal();
};
const close = () => document.getElementById(modalId.value).close();

const handleSubmit = async () => {
  errors.name = '';
  errors.title = '';
  if (!form.value.name?.trim()) errors.name = 'Provide a collection name.';
  if (!section.value.title?.trim()) errors.title = 'Provide a section title.';
  if (errors.name || errors.title) return;

  submitting.value = true;
  const ok = await store.update(props.item.id, {
    name: form.value.name.trim(),
    status: form.value.status,
    body: sbdSectionToBody(section.value),
  });
  submitting.value = false;
  if (ok) close();
};
</script>
