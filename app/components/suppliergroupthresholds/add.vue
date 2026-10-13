<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Add Threshold</span>
    </button>
    <dialog :id="`new_threshold_modal_${suppliergroupId}`" class="modal">
      <div class="modal-box w-11/12 max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Threshold</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('new_threshold_modal_${suppliergroupId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label class="fieldset">
              <span class="fieldset-legend">Procurement Group</span>
              <select
                v-model="form.procurementgroup_id"
                :class="['select select-bordered w-full', errors.procurementgroup_id ? 'select-error' : '']"
              >
                <option value="">Select procurement group</option>
                <option v-for="pg in pgStore.items" :key="pg.id" :value="pg.id">{{ pg.name }}</option>
              </select>
              <label v-if="errors.procurementgroup_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.procurementgroup_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Procurement Method</span>
              <select
                v-model="form.procurementmethod_id"
                :class="['select select-bordered w-full', errors.procurementmethod_id ? 'select-error' : '']"
              >
                <option value="">Select procurement method</option>
                <option v-for="pm in pmStore.items" :key="pm.id" :value="pm.id">{{ pm.name }}</option>
              </select>
              <label v-if="errors.procurementmethod_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.procurementmethod_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Currency</span>
              <select
                v-model="form.currency_id"
                :class="['select select-bordered w-full', errors.currency_id ? 'select-error' : '']"
              >
                <option value="">Select currency</option>
                <option v-for="c in currencyStore.items" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
              </select>
              <label v-if="errors.currency_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.currency_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Lower Limit</span>
              <input
                type="number"
                step="0.01"
                min="0"
                v-model="form.lower_limit"
                placeholder="0.00"
                :class="['input input-bordered w-full', errors.lower_limit ? 'input-error' : '']"
              />
              <label v-if="errors.lower_limit" class="label">
                <span class="label-text-alt text-red-600">{{ errors.lower_limit }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Upper Limit</span>
              <input
                type="number"
                step="0.01"
                min="0"
                v-model="form.upper_limit"
                placeholder="0.00"
                :class="['input input-bordered w-full', errors.upper_limit ? 'input-error' : '']"
              />
              <label v-if="errors.upper_limit" class="label">
                <span class="label-text-alt text-red-600">{{ errors.upper_limit }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('new_threshold_modal_${suppliergroupId}').close()`">Close</button>
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
  suppliergroupId: { type: Number, required: true },
});

const store = useSupplierGroupThresholdStore();
const pgStore = useProcurementGroupStore();
const pmStore = useProcurementMethodStore();
const currencyStore = useCurrencyStore();

const emptyForm = () => ({
  suppliergroup_id: props.suppliergroupId,
  procurementgroup_id: '',
  procurementmethod_id: '',
  currency_id: '',
  lower_limit: '',
  upper_limit: '',
});

const form = ref(emptyForm());
const errors = reactive({
  suppliergroup_id: '',
  procurementgroup_id: '',
  procurementmethod_id: '',
  currency_id: '',
  lower_limit: '',
  upper_limit: '',
});
const submitting = ref(false);

const openModal = () => document.getElementById(`new_threshold_modal_${props.suppliergroupId}`).showModal();

const resetForm = () => {
  form.value = emptyForm();
  Object.keys(errors).forEach((k) => (errors[k] = ''));
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await SupplierGroupThresholdSchema.validate(form.value, { abortEarly: false });
    await store.create(valid, props.suppliergroupId);
    resetForm();
    document.getElementById(`new_threshold_modal_${props.suppliergroupId}`).close();
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
