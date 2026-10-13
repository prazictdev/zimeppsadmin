<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Add Fee</span>
    </button>
    <dialog :id="`new_registrationfee_modal_${suppliergroupId}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Registration Fee</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('new_registrationfee_modal_${suppliergroupId}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Locality</span>
              <select
                v-model="form.locality"
                :class="['select select-bordered w-full', errors.locality ? 'select-error' : '']"
              >
                <option value="all">All (Local &amp; Foreign)</option>
                <option value="local">Local Only</option>
                <option value="foreign">Foreign Only</option>
              </select>
              <label v-if="errors.locality" class="label">
                <span class="label-text-alt text-red-600">{{ errors.locality }}</span>
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
              <span class="fieldset-legend">Fee</span>
              <input
                type="number"
                step="0.01"
                min="0"
                v-model="form.fee"
                placeholder="0.00"
                :class="['input input-bordered w-full', errors.fee ? 'input-error' : '']"
              />
              <label v-if="errors.fee" class="label">
                <span class="label-text-alt text-red-600">{{ errors.fee }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Inventory Item (for invoicing)</span>
              <select
                v-model="form.inventoryitem_id"
                :class="['select select-bordered w-full', errors.inventoryitem_id ? 'select-error' : '']"
              >
                <option value="">None (use global assignment)</option>
                <option v-for="item in inventoryItemStore.items" :key="item.id" :value="item.id">
                  {{ item.name }}{{ item.bankaccounttype ? ` — ${item.bankaccounttype.name}` : '' }}
                </option>
              </select>
              <label v-if="errors.inventoryitem_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.inventoryitem_id }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('new_registrationfee_modal_${suppliergroupId}').close()`"
            >Close</button>
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

const store = useRegistrationFeeStore();
const currencyStore = useCurrencyStore();
const inventoryItemStore = useInventoryItemStore();

const emptyForm = () => ({
  suppliergroup_id: props.suppliergroupId,
  locality: 'all',
  currency_id: '',
  fee: '',
  inventoryitem_id: '',
});

const form = ref(emptyForm());
const errors = reactive({ locality: '', currency_id: '', fee: '', inventoryitem_id: '' });
const submitting = ref(false);

const openModal = async () => {
  if (inventoryItemStore.items.length === 0) await inventoryItemStore.fetchAll();
  document.getElementById(`new_registrationfee_modal_${props.suppliergroupId}`).showModal();
};

const resetForm = () => {
  form.value = emptyForm();
  Object.keys(errors).forEach((k) => (errors[k] = ''));
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await RegistrationFeeSchema.validate(form.value, { abortEarly: false });
    await store.create(valid, props.suppliergroupId);
    resetForm();
    document.getElementById(`new_registrationfee_modal_${props.suppliergroupId}`).close();
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
