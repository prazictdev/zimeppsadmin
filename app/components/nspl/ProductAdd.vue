<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:package-plus" />
      <span class="hidden md:block">Add Product</span>
    </button>
    <dialog id="new_nspl_product_modal" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Product</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_nspl_product_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Division</span>
              <select
                v-model.number="selectedDivisionId"
                class="select select-bordered w-full"
                @change="onDivisionChange"
              >
                <option :value="null" disabled>Select division</option>
                <option v-for="d in store.divisions" :key="d.id" :value="d.id">
                  {{ d.code }} · {{ d.name }}
                </option>
              </select>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Section</span>
              <select
                v-model.number="form.section_id"
                :class="['select select-bordered w-full', errors.section_id ? 'select-error' : '']"
                :disabled="!selectedDivisionId"
              >
                <option :value="null" disabled>Select section</option>
                <option v-for="s in scopedSections" :key="s.id" :value="s.id">
                  {{ s.code }} · {{ s.name }}
                </option>
              </select>
              <label v-if="errors.section_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.section_id }}</span>
              </label>
            </label>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Code</span>
              <input
                v-model="form.code"
                type="text"
                placeholder="1.1.1"
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

          <label class="fieldset">
            <span class="fieldset-legend">Specifications</span>
            <textarea
              v-model="form.specifications"
              rows="3"
              :class="['textarea textarea-bordered w-full', errors.specifications ? 'textarea-error' : '']"
            ></textarea>
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">USD price (leave blank if unavailable)</span>
              <input
                v-model="form.usd_price"
                type="number"
                step="0.01"
                min="0"
                :class="['input input-bordered w-full', errors.usd_price ? 'input-error' : '']"
              />
              <label v-if="errors.usd_price" class="label">
                <span class="label-text-alt text-red-600">{{ errors.usd_price }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Branded?</span>
              <label class="label cursor-pointer justify-start gap-2">
                <input v-model="form.is_branded" type="checkbox" class="toggle toggle-sm" />
                <span class="label-text">Mark as branded</span>
              </label>
            </label>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_nspl_product_modal.close()">Close</button>
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
const props = defineProps({ editionId: { type: Number, required: true } });
const store = useNsplStore();

const selectedDivisionId = ref(null);
const form = ref({
  section_id: null,
  code: '',
  name: '',
  specifications: '',
  usd_price: null,
  is_branded: false,
});
const errors = reactive({ section_id: '', code: '', name: '', specifications: '', usd_price: '' });
const submitting = ref(false);

const scopedSections = computed(() =>
  selectedDivisionId.value ? store.sections.filter((s) => s.division_id === selectedDivisionId.value) : []
);

const openModal = () => document.getElementById('new_nspl_product_modal').showModal();

const onDivisionChange = async () => {
  form.value.section_id = null;
  if (selectedDivisionId.value) await store.fetchSections(selectedDivisionId.value);
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await NsplProductSchema.validate(form.value, { abortEarly: false });
    const ok = await store.createProduct(valid, props.editionId);
    if (ok) {
      form.value = { section_id: null, code: '', name: '', specifications: '', usd_price: null, is_branded: false };
      selectedDivisionId.value = null;
      document.getElementById('new_nspl_product_modal').close();
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
