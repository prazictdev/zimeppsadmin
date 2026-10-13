<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Add Threshold</span>
    </button>
    <dialog id="new_pc_threshold_modal" class="modal">
      <div class="modal-box max-w-xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Threshold</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_pc_threshold_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="mt-3 flex flex-col gap-3">
          <div class="grid grid-cols-2 gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Procurement group</span>
              <select
                v-model.number="form.procurementgroup_id"
                :class="['select select-bordered w-full', errors.procurementgroup_id ? 'select-error' : '']"
              >
                <option :value="null" disabled>Select group</option>
                <option v-for="g in store.procurementgroups" :key="g.id" :value="g.id">
                  {{ g.name }}
                </option>
              </select>
              <label v-if="errors.procurementgroup_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.procurementgroup_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Procurement method</span>
              <select
                v-model.number="form.procurementmethod_id"
                :class="['select select-bordered w-full', errors.procurementmethod_id ? 'select-error' : '']"
              >
                <option :value="null" disabled>Select method</option>
                <option v-for="m in store.procurementmethods" :key="m.id" :value="m.id">
                  {{ m.name }}
                </option>
              </select>
              <label v-if="errors.procurementmethod_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.procurementmethod_id }}</span>
              </label>
            </label>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <label class="fieldset col-span-2">
              <span class="fieldset-legend">Threshold amount</span>
              <input
                v-model.number="form.threshold_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="5000.00"
                :class="['input input-bordered w-full', errors.threshold_amount ? 'input-error' : '']"
              />
              <label v-if="errors.threshold_amount" class="label">
                <span class="label-text-alt text-red-600">{{ errors.threshold_amount }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Currency</span>
              <select v-model.number="form.currency_id" class="select select-bordered w-full">
                <option :value="null">USD (default)</option>
                <option v-for="c in store.currencies" :key="c.id" :value="c.id">{{ c.code }}</option>
              </select>
            </label>
          </div>

          <label class="fieldset">
            <span class="fieldset-legend">Notes (optional)</span>
            <textarea
              v-model="form.notes"
              rows="2"
              :class="['textarea textarea-bordered w-full', errors.notes ? 'textarea-error' : '']"
            ></textarea>
          </label>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_pc_threshold_modal.close()">Close</button>
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

const form = ref({
  procurementgroup_id: null,
  procurementmethod_id: null,
  currency_id: null,
  threshold_amount: null,
  notes: '',
});
const errors = reactive({
  procurementgroup_id: '',
  procurementmethod_id: '',
  threshold_amount: '',
  notes: '',
});
const submitting = ref(false);

const openModal = async () => {
  await store.fetchThresholdLookups();
  document.getElementById('new_pc_threshold_modal').showModal();
};

const handleSubmit = async () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  try {
    submitting.value = true;
    const valid = await ProcurementClassThresholdSchema.validate(form.value, { abortEarly: false });
    const ok = await store.addThreshold(
      { ...valid, procurementclass_id: props.classId },
      props.classId,
    );
    if (ok) {
      form.value = {
        procurementgroup_id: null,
        procurementmethod_id: null,
        currency_id: null,
        threshold_amount: null,
        notes: '',
      };
      document.getElementById('new_pc_threshold_modal').close();
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
