<template>
  <div>
    <button class="btn btn-primary btn-sm" @click="openModal">
      <Icon name="lucide:eye" />
      <span class="hidden md:block">View</span>
    </button>
    <dialog :id="dialogId" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold">
              Time Limits — {{ item.name }}
              <span v-if="item.code" class="text-base-content/60">({{ item.code }})</span>
            </h3>
            <p class="text-sm text-base-content/60">
              Configure cycle / lead day ranges for each procurement group.
              Min Cycle is calculated as Advertising + Evaluation + Standstill + SPOC (blank values count as zero).
            </p>
          </div>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div
          v-if="feedback"
          role="alert"
          :class="['alert mt-3', feedback.type === 'success' ? 'alert-success' : 'alert-error']"
        >
          <Icon :name="feedback.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'" />
          <span>{{ feedback.message }}</span>
          <button class="btn btn-ghost btn-xs" @click="feedback = null">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="mt-4 overflow-x-auto">
          <table class="table table-sm w-full">
            <thead>
              <tr class="text-left">
                <th>Procurement Group</th>
                <th title="Statutory minimum advertising window from bid notice publication to bid closing">Advertising</th>
                <th title="Days from bid closing to publish-award-notice (excludes the 10-day SPOC adder)">Evaluation</th>
                <th title="Days between publish-award-notice and contract signing">Standstill</th>
                <th title="Days added to evaluation when the item is subject to SPOC oversight">SPOC adder</th>
                <th title="Automatically calculated: Advertising + Evaluation + Standstill + SPOC">Min Cycle</th>
                <th title="Legacy minimum lead time days — used as the floor in Tier 2 R4">Min Lead</th>
                <th>Notes</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.procurementgroup_id">
                <td class="font-medium">{{ row.group_name }}</td>
                <td><input v-model.number="row.minimum_advertising_days" type="number" min="0" class="input input-bordered input-sm w-20 text-right" /></td>
                <td><input v-model.number="row.minimum_evaluation_days" type="number" min="0" class="input input-bordered input-sm w-20 text-right" /></td>
                <td><input v-model.number="row.standstill_days" type="number" min="0" class="input input-bordered input-sm w-20 text-right" /></td>
                <td><input v-model.number="row.spoc_days" type="number" min="0" class="input input-bordered input-sm w-20 text-right" /></td>
                <td><input :value="minimumCycleDays(row)" type="number" readonly :aria-label="`Minimum cycle days for ${row.group_name}`" class="input input-bordered input-sm w-20 bg-base-200 text-right" /></td>
                <td><input v-model.number="row.minimum_lead_days" type="number" min="0" class="input input-bordered input-sm w-20 text-right" /></td>
                <td><input v-model="row.notes" type="text" class="input input-bordered input-sm w-full" /></td>
                <td class="text-right">
                  <div class="flex justify-end gap-1">
                    <button
                      class="btn btn-primary btn-xs"
                      :disabled="savingId === row.procurementgroup_id || !isDirty(row)"
                      @click="saveRow(row)"
                    >
                      <span v-if="savingId === row.procurementgroup_id">Saving...</span>
                      <span v-else>{{ row.id ? 'Update' : 'Save' }}</span>
                    </button>
                    <button
                      v-if="row.id"
                      class="btn btn-error btn-xs"
                      :disabled="savingId === row.procurementgroup_id"
                      @click="deleteRow(row)"
                    >
                      <Icon name="lucide:trash-2" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!rows.length">
                <td colspan="9" class="text-center text-base-content/50">No procurement groups configured.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-action">
          <button class="btn" type="button" @click="closeModal">Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });

const store = useProcurementMethodTimelimitStore();
const { createOne, updateOne, deleteOne } = useProcurementMethodTimelimitHelper();
const dialogId = computed(() => `view_pm_timelimits_${props.item.id}`);

const rows = ref([]);
const baseline = ref({});
const loading = ref(false);
const savingId = ref(null);
const feedback = ref(null);
let feedbackTimer = null;

const showFeedback = (type, message) => {
  feedback.value = { type, message };
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedback.value = null;
  }, 5000);
};

const extractMessage = (response, err, fallback) => {
  if (err?.data?.message) return err.data.message;
  if (err?.message) return err.message;
  if (response?.value?.message) return response.value.message;
  return fallback;
};

const buildRows = () => {
  const existing = new Map(
    store.items
      .filter((r) => r.procurementmethod_id === props.item.id)
      .map((r) => [r.procurementgroup_id, r]),
  );
  rows.value = store.procurementgroups.map((g) => {
    const r = existing.get(g.id);
    return {
      id: r?.id ?? null,
      procurementgroup_id: g.id,
      group_name: g.name,
      minimum_advertising_days: r?.minimum_advertising_days ?? null,
      minimum_evaluation_days: r?.minimum_evaluation_days ?? null,
      standstill_days: r?.standstill_days ?? null,
      spoc_days: r?.spoc_days ?? null,
      minimum_cycle_days: r?.minimum_cycle_days ?? null,
      minimum_lead_days: r?.minimum_lead_days ?? null,
      notes: r?.notes ?? '',
    };
  });
  baseline.value = Object.fromEntries(
    rows.value.map((r) => [r.procurementgroup_id, JSON.stringify({ ...rowFields(r), minimum_cycle_days: r.minimum_cycle_days })]),
  );
};

const minimumCycleDays = (row) => [
  row.minimum_advertising_days,
  row.minimum_evaluation_days,
  row.standstill_days,
  row.spoc_days,
].reduce((total, days) => total + (Number(days) || 0), 0);

const rowFields = (r) => ({
  minimum_advertising_days: r.minimum_advertising_days,
  minimum_evaluation_days: r.minimum_evaluation_days,
  standstill_days: r.standstill_days,
  spoc_days: r.spoc_days,
  minimum_cycle_days: minimumCycleDays(r),
  minimum_lead_days: r.minimum_lead_days,
  notes: r.notes,
});

const isDirty = (row) =>
  baseline.value[row.procurementgroup_id] !== JSON.stringify(rowFields(row));

const openModal = async () => {
  feedback.value = null;
  loading.value = true;
  await Promise.all([store.fetchLookups(), store.fetchAll()]);
  buildRows();
  loading.value = false;
  document.getElementById(dialogId.value).showModal();
};

const closeModal = () => document.getElementById(dialogId.value).close();

const saveRow = async (row) => {
  savingId.value = row.procurementgroup_id;
  const payload = {
    procurementmethod_id: props.item.id,
    procurementgroup_id: row.procurementgroup_id,
    ...rowFields(row),
  };

  const { data: response, status, error } = row.id
    ? await updateOne(row.id, payload)
    : await createOne(payload);

  const res = response?.value;
  if (status?.value && res?.status === true) {
    showFeedback(
      'success',
      res.message || `Time limit for ${row.group_name} saved.`,
    );
    await store.fetchAll();
    buildRows();
  } else {
    showFeedback(
      'error',
      extractMessage(response, error?.value, `Failed to save time limit for ${row.group_name}.`),
    );
  }

  savingId.value = null;
};

const deleteRow = async (row) => {
  if (!row.id) return;
  if (!confirm(`Remove time limit for ${row.group_name}?`)) return;
  savingId.value = row.procurementgroup_id;

  const { data: response, status, error } = await deleteOne(row.id);
  const res = response?.value;
  if (status?.value && res?.status === true) {
    showFeedback(
      'success',
      res.message || `Time limit for ${row.group_name} removed.`,
    );
    await store.fetchAll();
    buildRows();
  } else {
    showFeedback(
      'error',
      extractMessage(response, error?.value, `Failed to remove time limit for ${row.group_name}.`),
    );
  }

  savingId.value = null;
};
</script>
