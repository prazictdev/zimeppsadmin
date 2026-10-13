<template>
  <div>
    <button class="btn btn-outline btn-sm" @click="openModal">
      <Icon name="lucide:upload" />
      <span class="hidden md:block">Import CSV</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Import NSPL Products</h3>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="mt-3 rounded-lg border border-base-200 bg-base-200/40 p-3 text-sm">
          <p class="font-medium">Expected CSV columns</p>
          <p class="mt-1 text-base-content/70">
            <span class="font-mono">division_code, division_name, section_code, section_name, category_code, product_code, product_name, specifications, usd_price</span>.
            A header row is optional. Missing divisions/sections are auto-created. Existing products
            (matched on section + product_code) are updated.
            Use <span class="font-mono">A</span>, <span class="font-mono">B</span>, or <span class="font-mono">C</span> for category_code.
            Leave usd_price blank or as <span class="font-mono">-</span> for unpriced items.
          </p>
          <pre class="mt-2 overflow-x-auto rounded bg-base-100 p-2 text-xs">division_code,division_name,section_code,section_name,category_code,product_code,product_name,specifications,usd_price
1,New Light Motor Vehicles,1.2,Ford,A,1.2.1,Ford Everest TDCi SUV (4x2),"Displacement: 2.2 L, Automatic, Diesel, Duty Paid",64091.00
2,Office Equipment and Accessories,2.1,Laptops,A,2.1.1,Laptop,Intel i5 8GB/1TB,585.21</pre>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-4">
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
const props = defineProps({ editionId: { type: Number, required: true } });
const store = useNsplStore();

const modalId = computed(() => `nspl_product_import_modal_${props.editionId}`);

const fileInput = ref(null);
const file = ref(null);
const errors = reactive({ file: '' });
const submitting = ref(false);
const result = ref(null);

const openModal = () => document.getElementById(modalId.value).showModal();

const closeModal = () => {
  document.getElementById(modalId.value).close();
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
  const data = await store.importProducts(props.editionId, file.value);
  if (data) {
    result.value = data;
    await store.fetchDivisions(props.editionId);
  }
  submitting.value = false;
};
</script>
