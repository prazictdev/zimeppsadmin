<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:dollar-sign" />
      <span class="hidden md:block">Add Fee</span>
    </button>
    <dialog id="new_pc_fee_modal" class="modal">
      <div class="modal-box max-w-xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Fee</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_pc_fee_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <label class="fieldset">
            <span class="fieldset-legend">Inventory item</span>
            <select
              v-model.number="form.inventoryitem_id"
              :class="['select select-bordered w-full', errors.inventoryitem_id ? 'select-error' : '']"
            >
              <option :value="null" disabled>Select inventory item</option>
              <option v-for="ii in store.inventoryitems" :key="ii.id" :value="ii.id">
                {{ ii.name }}<span v-if="ii.glcode"> · {{ ii.glcode }}</span>
              </option>
            </select>
            <label v-if="errors.inventoryitem_id" class="label">
              <span class="label-text-alt text-red-600">{{ errors.inventoryitem_id }}</span>
            </label>
          </label>

          <div class="grid grid-cols-3 gap-3">
            <label class="fieldset col-span-2">
              <span class="fieldset-legend">Amount</span>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="100.00"
                :class="['input input-bordered w-full', errors.amount ? 'input-error' : '']"
              />
              <label v-if="errors.amount" class="label">
                <span class="label-text-alt text-red-600">{{ errors.amount }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Currency</span>
              <select
                v-model.number="form.currency_id"
                :class="['select select-bordered w-full', errors.currency_id ? 'select-error' : '']"
              >
                <option :value="null" disabled>Select</option>
                <option v-for="c in store.currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
              </select>
              <label v-if="errors.currency_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.currency_id }}</span>
              </label>
            </label>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_pc_fee_modal.close()">Close</button>
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
const props = defineProps({ classId: { type: Number, required: true } });
const store = useProcurementClassStore();

const form = ref({ inventoryitem_id: null, currency_id: null, amount: null });
const errors = reactive({ inventoryitem_id: '', currency_id: '', amount: '' });
const submitting = ref(false);

const openModal = async () => {
  await store.fetchFeeLookups();
  document.getElementById('new_pc_fee_modal').showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await ProcurementClassFeeSchema.validate(form.value, { abortEarly: false });
    const ok = await store.addFee(
      { ...valid, procurementclass_id: props.classId },
      props.classId,
    );
    if (ok) {
      form.value = { inventoryitem_id: null, currency_id: null, amount: null };
      document.getElementById('new_pc_fee_modal').close();
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
