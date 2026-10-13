<template>
  <div>
    <button class="btn btn-outline btn-sm" @click="openModal">
      <Icon name="lucide:upload" />
      <span class="hidden md:block">Import CSV</span>
    </button>
    <dialog id="import_unspsc_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Import UNSPSC Codes</h3>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="mt-3 rounded-lg border border-base-200 bg-base-200/40 p-3 text-sm">
          <p class="font-medium">Expected CSV format</p>
          <p class="mt-1 text-base-content/70">
            Two columns: <span class="font-mono">code,name</span>. A header row is optional.
            Existing codes are updated; new codes are added with status <span class="font-mono">ACTIVE</span>.
          </p>
          <pre class="mt-2 rounded bg-base-100 p-2 text-xs">code,name
43211500,Computers
44121701,Pens</pre>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-4">
          <label class="fieldset"><span class="fieldset-legend">Official catalogue release/version</span><input v-model="catalogue.catalogue_version" class="input input-bordered w-full" required maxlength="255" placeholder="Release shown on the source catalogue" /></label>
          <label class="fieldset"><span class="fieldset-legend">Catalogue source URL</span><input v-model="catalogue.catalogue_source" type="url" class="input input-bordered w-full" required maxlength="1000" placeholder="https://www.undp.org/unspsc" /><span class="text-xs text-base-content/60">Import codes from the official catalogue. The release and source are recorded for each imported code.</span></label>
          <label class="fieldset">
            <span class="fieldset-legend">CSV file</span>
            <input
              ref="fileInput"
              type="file"
              accept=".csv,text/csv,text/plain"
              :class="['file-input file-input-bordered w-full', errors.file ? 'file-input-error' : '']"
              @change="onFileChange"
            />
            <label v-if="errors.file" class="label">
              <span class="label-text-alt text-red-600">{{ errors.file }}</span>
            </label>
          </label>

          <div v-if="result" class="mt-4 rounded-lg border border-base-200 bg-base-100 p-3 text-sm">
            <p>
              <span class="font-bold text-success">{{ result.inserted }}</span> inserted ·
              <span class="font-bold text-info">{{ result.updated }}</span> updated ·
              <span class="font-bold text-base-content/60">{{ result.skipped }}</span> skipped
            </p>
            <details v-if="result.errors?.length" class="mt-2">
              <summary class="cursor-pointer text-warning">{{ result.errors.length }} row issue(s)</summary>
              <ul class="mt-1 list-disc pl-6 text-xs text-base-content/70">
                <li v-for="(err, i) in result.errors" :key="i">{{ err }}</li>
              </ul>
            </details>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" @click="closeModal">Close</button>
            <button class="btn btn-primary" type="submit" :disabled="submitting || !file">
              <span v-if="submitting">Importing...</span>
              <span v-else>Upload</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const store = useUnspscStore();

const fileInput = ref(null);
const file = ref(null);
const errors = reactive({ file: '' });
const submitting = ref(false);
const result = ref(null);
const catalogue = reactive({ catalogue_version: '', catalogue_source: '' });

const openModal = () => document.getElementById('import_unspsc_modal').showModal();

const closeModal = () => {
  document.getElementById('import_unspsc_modal').close();
  resetForm();
};

const resetForm = () => {
  file.value = null;
  errors.file = '';
  result.value = null;
  if (fileInput.value) fileInput.value.value = '';
};

const onFileChange = (e) => {
  errors.file = '';
  result.value = null;
  const selected = e.target.files?.[0] ?? null;
  if (selected && !/\.(csv|txt)$/i.test(selected.name)) {
    errors.file = 'Please select a .csv or .txt file.';
    file.value = null;
    return;
  }
  file.value = selected;
};

const handleSubmit = async () => {
  if (!file.value) {
    errors.file = 'Please choose a file.';
    return;
  }
  errors.file = '';
  submitting.value = true;
  const data = await store.importCsv(file.value, catalogue);
  if (data) result.value = data;
  submitting.value = false;
};
</script>
