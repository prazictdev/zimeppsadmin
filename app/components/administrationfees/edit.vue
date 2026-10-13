<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_administrationfee_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Administration Fee</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_administrationfee_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
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
              <span class="fieldset-legend">Participant</span>
              <select
                v-model="form.participant"
                :class="['select select-bordered w-full', errors.participant ? 'select-error' : '']"
              >
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
              <label v-if="errors.participant" class="label">
                <span class="label-text-alt text-red-600">{{ errors.participant }}</span>
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

            <label class="fieldset">
              <span class="fieldset-legend">Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                v-model.number="form.amount"
                :class="['input input-bordered w-full', errors.amount ? 'input-error' : '']"
              />
              <label v-if="errors.amount" class="label">
                <span class="label-text-alt text-red-600">{{ errors.amount }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Description (optional)</span>
              <input type="text" v-model="form.description" class="input input-bordered w-full" />
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_administrationfee_modal_${item.id}').close()`"
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
const store = useAdministrationFeeStore();
const { getCurrencies } = useCurrencyHelper();
const { getProcurementGroups } = useProcurementGroupHelper();

const currencies = ref([]);
const groups = ref([]);
const form = ref({ participant: 'Domestic', procurementgroup_id: null, currency_id: null, amount: null, description: '' });
const errors = reactive({ participant: '', procurementgroup_id: '', currency_id: '', amount: '' });
const submitting = ref(false);

const loadLookups = async () => {
  if (!currencies.value.length) {
    const { data, error } = await getCurrencies();
    if (!error.value) currencies.value = data.value?.data ?? [];
  }
  if (!groups.value.length) {
    const { data, error } = await getProcurementGroups();
    if (!error.value) groups.value = data.value?.data ?? [];
  }
};

const openModal = async () => {
  await loadLookups();
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value = {
      participant: data.participant ?? 'Domestic',
      procurementgroup_id: data.procurementgroup_id ?? null,
      currency_id: data.currency_id ?? null,
      amount: data.amount != null ? Number(data.amount) : null,
      description: data.description ?? '',
    };
  }
  document.getElementById(`edit_administrationfee_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await AdministrationFeeSchema.validate(form.value, { abortEarly: false });
    const ok = await store.update(props.item.id, valid);
    if (ok) document.getElementById(`edit_administrationfee_modal_${props.item.id}`).close();
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
