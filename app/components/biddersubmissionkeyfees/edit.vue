<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_bidderkeyfee_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Fee</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('edit_bidderkeyfee_modal_${item.id}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Bidder type</span>
              <select v-model="form.bidder_type" :class="['select select-bordered w-full', errors.bidder_type ? 'select-error' : '']">
                <option value="">Select type...</option>
                <option value="DOMESTIC">Domestic</option>
                <option value="FOREIGN">Foreign</option>
              </select>
              <label v-if="errors.bidder_type" class="label"><span class="label-text-alt text-red-600">{{ errors.bidder_type }}</span></label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Currency</span>
              <select v-model.number="form.currency_id" :class="['select select-bordered w-full', errors.currency_id ? 'select-error' : '']">
                <option value="">Select currency...</option>
                <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
              </select>
              <label v-if="errors.currency_id" class="label"><span class="label-text-alt text-red-600">{{ errors.currency_id }}</span></label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Inventory item (bank-account routing)</span>
              <select v-model.number="form.inventoryitem_id" :class="['select select-bordered w-full', errors.inventoryitem_id ? 'select-error' : '']">
                <option value="">Select item...</option>
                <option v-for="i in inventoryItems" :key="i.id" :value="i.id">
                  {{ i.name }}<template v-if="i.bankaccounttype?.name"> · {{ i.bankaccounttype.name }}</template>
                </option>
              </select>
              <label v-if="errors.inventoryitem_id" class="label"><span class="label-text-alt text-red-600">{{ errors.inventoryitem_id }}</span></label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Amount</span>
              <input v-model.number="form.amount" type="number" step="0.01" min="0"
                     :class="['input input-bordered w-full', errors.amount ? 'input-error' : '']" />
              <label v-if="errors.amount" class="label"><span class="label-text-alt text-red-600">{{ errors.amount }}</span></label>
            </label>

            <div class="grid grid-cols-2 gap-2">
              <label class="fieldset">
                <span class="fieldset-legend">Effective from</span>
                <input v-model="form.effective_from" type="date"
                       :class="['input input-bordered w-full', errors.effective_from ? 'input-error' : '']" />
                <label v-if="errors.effective_from" class="label"><span class="label-text-alt text-red-600">{{ errors.effective_from }}</span></label>
              </label>
              <label class="fieldset">
                <span class="fieldset-legend">Effective to (optional)</span>
                <input v-model="form.effective_to" type="date"
                       :class="['input input-bordered w-full', errors.effective_to ? 'input-error' : '']" />
                <label v-if="errors.effective_to" class="label"><span class="label-text-alt text-red-600">{{ errors.effective_to }}</span></label>
              </label>
            </div>

            <label class="fieldset">
              <span class="fieldset-legend">SI / source (optional)</span>
              <input v-model="form.source_si" type="text" class="input input-bordered w-full" />
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Description (optional)</span>
              <textarea v-model="form.description" rows="2" class="textarea textarea-bordered w-full"></textarea>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('edit_bidderkeyfee_modal_${item.id}').close()`">Close</button>
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
const props = defineProps({ item: { type: Object, required: true } });
const store = useBidderSubmissionKeyFeeStore();
const currencyStore = useCurrencyStore();
const inventoryItemStore = useInventoryItemStore();
const currencies = computed(() => currencyStore.items ?? []);
const inventoryItems = computed(() => inventoryItemStore.items ?? []);

const form = ref({ bidder_type: '', currency_id: '', inventoryitem_id: '', amount: null, description: '', effective_from: '', effective_to: '', source_si: '' });
const errors = reactive({ bidder_type: '', currency_id: '', inventoryitem_id: '', amount: '', description: '', effective_from: '', effective_to: '', source_si: '' });
const submitting = ref(false);

const openModal = async () => {
  await Promise.all([
    currencies.value.length ? Promise.resolve() : currencyStore.fetchAll(),
    inventoryItems.value.length ? Promise.resolve() : inventoryItemStore.fetchAll(),
  ]);
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value = {
      bidder_type: data.bidder_type ?? '',
      currency_id: data.currency_id ?? '',
      inventoryitem_id: data.inventoryitem_id ?? '',
      amount: data.amount ?? null,
      description: data.description ?? '',
      effective_from: data.effective_from ? String(data.effective_from).slice(0, 10) : '',
      effective_to: data.effective_to ? String(data.effective_to).slice(0, 10) : '',
      source_si: data.source_si ?? '',
    };
  }
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  document.getElementById(`edit_bidderkeyfee_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await BidderSubmissionKeyFeeSchema.validate(form.value, { abortEarly: false });
    await store.update(props.item.id, { ...valid, effective_to: valid.effective_to || null });
    document.getElementById(`edit_bidderkeyfee_modal_${props.item.id}`).close();
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
