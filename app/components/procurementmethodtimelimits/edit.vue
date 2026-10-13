<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_pmtl_modal_${item.id}`" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Time Limit</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('edit_pmtl_modal_${item.id}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="form-control">
              <span class="label-text">Procurement Method</span>
              <select v-model.number="form.procurementmethod_id" :class="['select select-bordered', errors.procurementmethod_id ? 'select-error' : '']">
                <option :value="null">— Select —</option>
                <option v-for="m in store.procurementmethods" :key="m.id" :value="m.id">
                  {{ m.name }}<template v-if="m.code"> ({{ m.code }})</template>
                </option>
              </select>
              <span v-if="errors.procurementmethod_id" class="label-text-alt text-error">{{ errors.procurementmethod_id }}</span>
            </label>
            <label class="form-control">
              <span class="label-text">Procurement Group</span>
              <select v-model.number="form.procurementgroup_id" :class="['select select-bordered', errors.procurementgroup_id ? 'select-error' : '']">
                <option :value="null">— Select —</option>
                <option v-for="g in store.procurementgroups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
              <span v-if="errors.procurementgroup_id" class="label-text-alt text-error">{{ errors.procurementgroup_id }}</span>
            </label>
            <label class="form-control">
              <span class="label-text">Minimum Advertising Days</span>
              <input v-model.number="form.minimum_advertising_days" type="number" min="0" class="input input-bordered" />
            </label>
            <label class="form-control">
              <span class="label-text">Minimum Cycle Days</span>
              <input v-model.number="form.minimum_cycle_days" type="number" min="0" class="input input-bordered" />
            </label>
            <label class="form-control">
              <span class="label-text">Minimum Lead Days</span>
              <input v-model.number="form.minimum_lead_days" type="number" min="0" class="input input-bordered" />
            </label>
            <label class="form-control sm:col-span-2">
              <span class="label-text">Notes</span>
              <textarea v-model="form.notes" rows="2" class="textarea textarea-bordered"></textarea>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" :onclick="`document.getElementById('edit_pmtl_modal_${item.id}').close()`">Close</button>
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
const store = useProcurementMethodTimelimitStore();

const form = ref({
  procurementmethod_id: null,
  procurementgroup_id: null,
  minimum_advertising_days: null,
  minimum_cycle_days: null,
  minimum_lead_days: null,
  notes: '',
});
const errors = reactive({
  procurementmethod_id: '', procurementgroup_id: '',
});
const submitting = ref(false);

const openModal = async () => {
  await store.fetchLookups();
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value = {
      procurementmethod_id: data.procurementmethod_id ?? null,
      procurementgroup_id: data.procurementgroup_id ?? null,
      minimum_advertising_days: data.minimum_advertising_days ?? null,
      minimum_cycle_days: data.minimum_cycle_days ?? null,
      minimum_lead_days: data.minimum_lead_days ?? null,
      notes: data.notes ?? '',
    };
  }
  document.getElementById(`edit_pmtl_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  for (const k of Object.keys(errors)) errors[k] = '';
  try {
    submitting.value = true;
    const valid = await ProcurementMethodTimelimitSchema.validate(form.value, { abortEarly: false });
    const ok = await store.update(props.item.id, valid);
    if (ok) document.getElementById(`edit_pmtl_modal_${props.item.id}`).close();
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
