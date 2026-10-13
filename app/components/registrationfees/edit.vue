<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
    </button>
    <dialog :id="`edit_registrationfee_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Registration Fee</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_registrationfee_modal_${item.id}').close()`"
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
              :onclick="`document.getElementById('edit_registrationfee_modal_${item.id}').close()`"
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
  item: { type: Object, required: true },
  suppliergroupId: { type: Number, required: true },
});

const store = useRegistrationFeeStore();
const currencyStore = useCurrencyStore();
const inventoryItemStore = useInventoryItemStore();

const form = ref({ locality: 'all', currency_id: '', fee: '', inventoryitem_id: '' });
const errors = reactive({ locality: '', currency_id: '', fee: '', inventoryitem_id: '' });
const submitting = ref(false);

const openModal = async () => {
  if (inventoryItemStore.items.length === 0) await inventoryItemStore.fetchAll();
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value = {
      locality: data.locality ?? 'all',
      currency_id: data.currency_id ?? '',
      fee: data.fee ?? '',
      inventoryitem_id: data.inventoryitem_id ?? '',
    };
  }
  document.getElementById(`edit_registrationfee_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const payload = { ...form.value, suppliergroup_id: props.suppliergroupId };
    const valid = await RegistrationFeeSchema.validate(payload, { abortEarly: false });
    await store.update(props.item.id, valid, props.suppliergroupId);
    document.getElementById(`edit_registrationfee_modal_${props.item.id}`).close();
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
