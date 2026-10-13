<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_bidvalidityperiodfee_modal_${item.id}`" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Bid Security Fee Band</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_bidvalidityperiodfee_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="fieldset">
              <span class="fieldset-legend">Validity period (days)</span>
              <input
                type="number"
                min="1"
                v-model.number="form.bid_validity_period"
                :class="['input input-bordered w-full', errors.bid_validity_period ? 'input-error' : '']"
              />
              <label v-if="errors.bid_validity_period" class="label">
                <span class="label-text-alt text-red-600">{{ errors.bid_validity_period }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Locality</span>
              <select
                v-model="form.locality"
                :class="['select select-bordered w-full', errors.locality ? 'select-error' : '']"
              >
                <option value="local">Local (domestic)</option>
                <option value="foreign">Foreign</option>
                <option value="all">All (local &amp; foreign)</option>
              </select>
              <label v-if="errors.locality" class="label">
                <span class="label-text-alt text-red-600">{{ errors.locality }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Currency</span>
              <select
                v-model.number="form.currency_id"
                :class="['select select-bordered w-full', errors.currency_id ? 'select-error' : '']"
              >
                <option :value="null" disabled>Select currency</option>
                <option v-for="c in currencies" :key="c.id" :value="c.id">{{ c.code }} — {{ c.name }}</option>
              </select>
              <label v-if="errors.currency_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.currency_id }}</span>
              </label>
            </label>

            <div class="fieldset sm:col-span-2">
              <span class="fieldset-legend">Bid security band</span>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  v-model.number="form.min_amount"
                  placeholder="From"
                  :class="['input input-bordered w-full', errors.min_amount ? 'input-error' : '']"
                />
                <span class="text-sm text-base-content/60">to</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  v-model.number="form.max_amount"
                  placeholder="Below (blank = no upper limit)"
                  :class="['input input-bordered w-full', errors.max_amount ? 'input-error' : '']"
                />
              </div>
              <label v-if="errors.min_amount || errors.max_amount" class="label">
                <span class="label-text-alt text-red-600">{{ errors.min_amount || errors.max_amount }}</span>
              </label>
            </div>

            <label class="fieldset">
              <span class="fieldset-legend">Fee type</span>
              <select v-model="form.fee_type" class="select select-bordered w-full">
                <option value="flat">Flat fee</option>
                <option value="percentage">% of bid security</option>
              </select>
            </label>

            <label v-if="form.fee_type === 'flat'" class="fieldset">
              <span class="fieldset-legend">Fee amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                v-model.number="form.fee"
                :class="['input input-bordered w-full', errors.fee ? 'input-error' : '']"
              />
              <label v-if="errors.fee" class="label">
                <span class="label-text-alt text-red-600">{{ errors.fee }}</span>
              </label>
            </label>

            <label v-else class="fieldset">
              <span class="fieldset-legend">Percentage of bid security</span>
              <div class="join">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.001"
                  v-model.number="form.fee_percentage"
                  :class="['input input-bordered join-item w-full', errors.fee_percentage ? 'input-error' : '']"
                />
                <span class="btn btn-disabled join-item no-animation">%</span>
              </div>
              <label v-if="errors.fee_percentage" class="label">
                <span class="label-text-alt text-red-600">{{ errors.fee_percentage }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Extension days (optional)</span>
              <input
                type="number"
                min="1"
                v-model.number="form.extension_days"
                :class="['input input-bordered w-full', errors.extension_days ? 'input-error' : '']"
              />
              <label v-if="errors.extension_days" class="label">
                <span class="label-text-alt text-red-600">{{ errors.extension_days }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Extension fee (% of establishment fee)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                v-model.number="form.extension_percentage"
                :class="['input input-bordered w-full', errors.extension_percentage ? 'input-error' : '']"
              />
              <label v-if="errors.extension_percentage" class="label">
                <span class="label-text-alt text-red-600">{{ errors.extension_percentage }}</span>
              </label>
            </label>

            <label class="fieldset sm:col-span-2">
              <span class="fieldset-legend">Description (optional)</span>
              <input type="text" v-model="form.description" class="input input-bordered w-full" />
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_bidvalidityperiodfee_modal_${item.id}').close()`"
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
const props = defineProps({ item: { type: Object, required: true } });
const store = useBidValidityPeriodFeeStore();
const { getCurrencies } = useCurrencyHelper();

const currencies = ref([]);
const form = ref({
  bid_validity_period: null, locality: 'local', currency_id: null, min_amount: 0, max_amount: null,
  fee_type: 'flat', fee: null, fee_percentage: null, extension_days: null, extension_percentage: null, description: '',
});
const errors = reactive({
  bid_validity_period: '', locality: '', currency_id: '', min_amount: '', max_amount: '',
  fee: '', fee_percentage: '', extension_days: '', extension_percentage: '',
});
const submitting = ref(false);

const loadCurrencies = async () => {
  if (currencies.value.length) return;
  const { data, error } = await getCurrencies();
  if (!error.value) currencies.value = data.value?.data ?? [];
};

const openModal = async () => {
  await loadCurrencies();
  const data = await store.findOne(props.item.id);
  if (data) {
    const isPercentage = data.fee == null && data.fee_percentage != null;
    form.value = {
      bid_validity_period: data.bid_validity_period ?? null,
      locality: data.locality ?? 'local',
      currency_id: data.currency_id ?? null,
      min_amount: data.min_amount != null ? Number(data.min_amount) : 0,
      max_amount: data.max_amount != null ? Number(data.max_amount) : null,
      fee_type: isPercentage ? 'percentage' : 'flat',
      fee: data.fee != null ? Number(data.fee) : null,
      fee_percentage: data.fee_percentage != null ? Number(data.fee_percentage) : null,
      extension_days: data.extension_days ?? null,
      extension_percentage: data.extension_percentage != null ? Number(data.extension_percentage) : null,
      description: data.description ?? '',
    };
  }
  document.getElementById(`edit_bidvalidityperiodfee_modal_${props.item.id}`).showModal();
};

const clearErrors = () => Object.keys(errors).forEach((k) => (errors[k] = ''));

const buildPayload = (valid) => {
  const payload = { ...valid };
  if (payload.fee_type === 'flat') payload.fee_percentage = null;
  else payload.fee = null;
  delete payload.fee_type;
  return payload;
};

const handleSubmit = async () => {
  clearErrors();
  try {
    submitting.value = true;
    const valid = await BidValidityPeriodFeeSchema.validate(form.value, { abortEarly: false });
    const ok = await store.update(props.item.id, buildPayload(valid));
    if (ok) document.getElementById(`edit_bidvalidityperiodfee_modal_${props.item.id}`).close();
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
