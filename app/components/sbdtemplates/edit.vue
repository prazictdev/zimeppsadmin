<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_sbdtemplate_modal_${item.id}`" class="modal">
      <div class="modal-box flex h-screen max-h-none w-screen max-w-none flex-col gap-3 rounded-none p-4 sm:p-5">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold">Edit SBD Template</h3>
            <p class="text-xs text-base-content/60">
              Edit the curated bidding document. Use <span class="font-medium">Tokens</span> to insert step 1–7 placeholders.
            </p>
          </div>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_sbdtemplate_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label class="fieldset">
            <span class="fieldset-legend">Procurement group</span>
            <select
              v-model.number="form.procurementgroup_id"
              :class="['select select-bordered w-full', errors.procurementgroup_id ? 'select-error' : '']"
            >
              <option :value="null" disabled>Select procurement group</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.code }} — {{ g.name }}</option>
            </select>
            <label v-if="errors.procurementgroup_id" class="label">
              <span class="label-text-alt text-red-600">{{ errors.procurementgroup_id }}</span>
            </label>
          </label>
          <label class="fieldset">
            <span class="fieldset-legend">Template name</span>
            <input
              type="text"
              v-model="form.name"
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

        <SbdtemplatesEditor
          ref="editorRef"
          v-model="bodyHtml"
          :tokens="tokens"
          :dialog-id="`edit-${item.id}`"
          @load-default="loadDefault"
        />
        <p v-if="errors.body_html" class="text-xs text-red-600">{{ errors.body_html }}</p>

        <div class="flex justify-end gap-2 border-t border-base-200 pt-3">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('edit_sbdtemplate_modal_${item.id}').close()`"
          >Close</button>
          <button class="btn btn-primary" type="button" :disabled="submitting" @click="handleSubmit">
            <span v-if="submitting">Saving...</span>
            <span v-else>Save template</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useSbdTemplateStore();
const { getProcurementGroups } = useProcurementGroupHelper();

const groups = ref([]);
const tokens = ref([]);
const bodyHtml = ref('');
const editorRef = ref(null);
const submitting = ref(false);

const form = ref({ procurementgroup_id: null, name: '', status: 'ACTIVE' });
const errors = reactive({ procurementgroup_id: '', name: '', body_html: '' });

const openModal = async () => {
  if (!groups.value.length) {
    const { data, error } = await getProcurementGroups();
    if (!error.value) groups.value = data.value?.data ?? [];
  }
  if (!tokens.value.length) {
    const defaults = await store.loadDefaults();
    tokens.value = defaults?.tokens ?? [];
  }
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value = {
      procurementgroup_id: data.procurementgroup_id ?? null,
      name: data.name ?? '',
      status: data.status ?? 'ACTIVE',
    };
    bodyHtml.value = data.compiled_html ?? data.source_html ?? '';
    editorRef.value?.setContent(bodyHtml.value);
  }
  document.getElementById(`edit_sbdtemplate_modal_${props.item.id}`).showModal();
};

const loadDefault = async () => {
  const defaults = await store.loadDefaults();
  if (defaults) {
    tokens.value = defaults.tokens ?? tokens.value;
    bodyHtml.value = defaults.body_html ?? '';
    editorRef.value?.setContent(defaults.body_html ?? '');
  }
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await SbdTemplateSchema.validate(form.value, { abortEarly: false });
    if (!bodyHtml.value || !bodyHtml.value.replace(/<[^>]*>/g, '').trim()) {
      errors.body_html = 'Provide the template content.';
      return;
    }
    const ok = await store.update(props.item.id, {
      ...valid,
      body_html: bodyHtml.value,
      status: form.value.status,
    });
    if (ok) document.getElementById(`edit_sbdtemplate_modal_${props.item.id}`).close();
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
