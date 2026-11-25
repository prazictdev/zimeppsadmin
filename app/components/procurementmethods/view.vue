<template>
  <div v-if="canAccess">
    <button class="btn btn-primary btn-sm" @click="openModal">
      <Icon name="lucide:scale" class="h-4 w-4" />
      <span class="hidden md:block">Time rules</span>
    </button>

    <dialog ref="dialog" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none bg-base-200 p-0">
        <header class="sticky top-0 z-20 border-b border-base-300 bg-base-100 px-5 py-4 shadow-sm lg:px-8">
          <div class="flex items-start justify-between gap-4">
            <div class="flex min-w-0 items-start gap-3">
              <div class="rounded-box bg-primary/10 p-3 text-primary">
                <Icon name="lucide:scale" class="h-6 w-6" />
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="text-xl font-bold">{{ item.name }}</h2>
                  <span v-if="item.code" class="badge badge-outline">{{ item.code }}</span>
                </div>
                <p class="mt-1 text-sm text-base-content/60">Statutory timetable controls by procurement group</p>
              </div>
            </div>
            <button type="button" class="btn btn-ghost btn-circle" aria-label="Close time rules" @click="closeModal">
              <Icon name="lucide:x" class="h-5 w-5" />
            </button>
          </div>
        </header>

        <main class="mx-auto w-full max-w-7xl space-y-5 p-5 lg:p-8">
          <div class="alert border border-info/25 bg-info/10 text-base-content">
            <Icon name="lucide:landmark" class="h-5 w-5 text-info" />
            <div>
              <p class="font-semibold">Legal floors are enforced by the API</p>
              <p class="text-sm text-base-content/70">
                Officers may choose a longer reasonable period, but cannot save below the applicable advertising or standstill floor.
                Evaluation is capped at 15 days because it is a normal completion limit, not a minimum.
              </p>
            </div>
          </div>

          <section class="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 class="font-semibold">Set up this method automatically</h3>
              <p class="mt-1 text-sm text-base-content/60">
                Populate every procurement group from the verified profile, then save all changed rows together.
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn btn-primary" :disabled="!canEdit || loading || bulkSaving" @click="fillAllBaselines">
                <Icon name="lucide:wand-sparkles" class="h-4 w-4" />
                Autofill all groups
              </button>
              <button type="button" class="btn" :disabled="!canEdit || bulkSaving || dirtyCount === 0 || invalidCount > 0" @click="saveAllRows">
                <span v-if="bulkSaving" class="loading loading-spinner loading-sm" />
                <Icon v-else name="lucide:save-all" class="h-4 w-4" />
                Save all changes
              </button>
            </div>
          </section>

          <div v-if="feedback" role="alert" :class="['alert', feedback.type === 'success' ? 'alert-success' : 'alert-error']">
            <Icon :name="feedback.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'" class="h-5 w-5" />
            <span>{{ feedback.message }}</span>
            <button type="button" class="btn btn-ghost btn-xs" @click="feedback = null"><Icon name="lucide:x" class="h-4 w-4" /></button>
          </div>

          <section class="stats stats-vertical w-full border border-base-300 bg-base-100 shadow-sm sm:stats-horizontal">
            <div class="stat py-4"><div class="stat-title">Procurement groups</div><div class="stat-value text-2xl">{{ rows.length }}</div></div>
            <div class="stat py-4"><div class="stat-title">Complete rules</div><div class="stat-value text-2xl text-success">{{ completeCount }}</div></div>
            <div class="stat py-4"><div class="stat-title">Need correction</div><div class="stat-value text-2xl" :class="invalidCount ? 'text-error' : 'text-success'">{{ invalidCount }}</div></div>
            <div class="stat py-4"><div class="stat-title">Unsaved</div><div class="stat-value text-2xl" :class="dirtyCount ? 'text-warning' : ''">{{ dirtyCount }}</div></div>
          </section>

          <div v-if="loading" class="flex min-h-80 items-center justify-center rounded-box border border-base-300 bg-base-100">
            <span class="loading loading-spinner loading-lg text-primary" />
          </div>

          <section v-else class="space-y-4">
            <article v-for="row in rows" :key="row.procurementgroup_id" class="card border border-base-300 bg-base-100 shadow-sm">
              <div class="card-body gap-5 p-5 lg:p-6">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="card-title text-base">{{ row.group_name }}</h3>
                      <span v-if="rowIssues(row).length" class="badge badge-error badge-sm">Needs correction</span>
                      <span v-else-if="row.id" class="badge badge-success badge-sm">Configured</span>
                      <span v-else class="badge badge-warning badge-sm">Not configured</span>
                      <span v-if="isDirty(row)" class="badge badge-outline badge-sm">Unsaved changes</span>
                    </div>
                    <p class="mt-1 text-xs text-base-content/55">{{ row.constraints.advertising_reference || 'A verified legal source is required for this method.' }}</p>
                  </div>
                  <button type="button" class="btn btn-ghost btn-sm" :disabled="!canEdit || bulkSaving || savingId === row.procurementgroup_id" @click="fillBaseline(row)">
                    <Icon name="lucide:rotate-ccw" class="h-4 w-4" /> Use legal baseline
                  </button>
                </div>

                <div v-if="rowIssues(row).length" class="alert alert-error py-3">
                  <Icon name="lucide:shield-alert" class="h-5 w-5" />
                  <ul class="list-disc pl-4 text-sm"><li v-for="issue in rowIssues(row)" :key="issue">{{ issue }}</li></ul>
                </div>

                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label class="fieldset">
                    <span class="fieldset-legend flex justify-between gap-2">Advertising period <span class="badge badge-ghost badge-xs">minimum</span></span>
                    <div class="join w-full">
                      <input v-model.number="row.minimum_advertising_days" type="number" :min="row.constraints.minimum_advertising_days ?? 0" max="365" class="input input-bordered join-item w-full text-right" :class="fieldError(row, 'minimum_advertising_days') ? 'input-error' : ''" :disabled="!canEdit">
                      <span class="btn join-item pointer-events-none">working days</span>
                    </div>
                    <span class="label text-xs text-base-content/60">{{ row.constraints.advertising_note }}</span>
                    <span v-if="fieldError(row, 'minimum_advertising_days')" class="text-xs text-error">{{ fieldError(row, 'minimum_advertising_days') }}</span>
                  </label>

                  <label class="fieldset">
                    <span class="fieldset-legend flex justify-between gap-2">Evaluation target <span class="badge badge-ghost badge-xs">maximum 15</span></span>
                    <div class="join w-full">
                      <input v-model.number="row.minimum_evaluation_days" type="number" min="1" :max="row.constraints.maximum_evaluation_days" class="input input-bordered join-item w-full text-right" :class="fieldError(row, 'minimum_evaluation_days') ? 'input-error' : ''" :disabled="!canEdit">
                      <span class="btn join-item pointer-events-none">days</span>
                    </div>
                    <span class="label text-xs text-base-content/60">Complete within 15 days · {{ row.constraints.evaluation_reference }}</span>
                    <span v-if="fieldError(row, 'minimum_evaluation_days')" class="text-xs text-error">{{ fieldError(row, 'minimum_evaluation_days') }}</span>
                  </label>

                  <label class="fieldset">
                    <span class="fieldset-legend flex justify-between gap-2">Standstill period <span class="badge badge-ghost badge-xs">minimum 14</span></span>
                    <div class="join w-full">
                      <input v-model.number="row.standstill_days" type="number" :min="row.constraints.minimum_standstill_days" max="365" class="input input-bordered join-item w-full text-right" :class="fieldError(row, 'standstill_days') ? 'input-error' : ''" :disabled="!canEdit">
                      <span class="btn join-item pointer-events-none">days</span>
                    </div>
                    <span class="label text-xs text-base-content/60">{{ row.constraints.standstill_reference }}</span>
                    <span v-if="fieldError(row, 'standstill_days')" class="text-xs text-error">{{ fieldError(row, 'standstill_days') }}</span>
                  </label>

                  <label class="fieldset">
                    <span class="fieldset-legend flex justify-between gap-2">SPOC allowance <span class="badge badge-ghost badge-xs">planning</span></span>
                    <div class="join w-full">
                      <input v-model.number="row.spoc_days" type="number" min="0" max="90" class="input input-bordered join-item w-full text-right" :class="fieldError(row, 'spoc_days') ? 'input-error' : ''" :disabled="!canEdit">
                      <span class="btn join-item pointer-events-none">days</span>
                    </div>
                    <span class="label text-xs text-base-content/60">{{ row.constraints.spoc_note }}</span>
                    <span v-if="fieldError(row, 'spoc_days')" class="text-xs text-error">{{ fieldError(row, 'spoc_days') }}</span>
                  </label>
                </div>

                <div class="grid gap-4 rounded-box bg-base-200 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_2fr]">
                  <label class="fieldset">
                    <span class="fieldset-legend">Calculated planning cycle</span>
                    <div class="join w-full"><input :value="planningCycleDays(row)" readonly class="input join-item w-full bg-base-100 text-right font-semibold"><span class="btn join-item pointer-events-none">days</span></div>
                    <span class="label text-xs text-base-content/60">Advertising + evaluation + standstill + SPOC</span>
                  </label>

                  <label class="fieldset">
                    <span class="fieldset-legend">Delivery lead allowance</span>
                    <div class="join w-full">
                      <input v-model.number="row.minimum_lead_days" type="number" min="0" max="365" class="input input-bordered join-item w-full text-right" :class="fieldError(row, 'minimum_lead_days') ? 'input-error' : ''" :disabled="!canEdit">
                      <span class="btn join-item pointer-events-none">days</span>
                    </div>
                    <span class="label text-xs text-base-content/60">Internal planning value, not a statutory minimum</span>
                    <span v-if="fieldError(row, 'minimum_lead_days')" class="text-xs text-error">{{ fieldError(row, 'minimum_lead_days') }}</span>
                  </label>

                  <label class="fieldset">
                    <span class="fieldset-legend">Administrative note</span>
                    <textarea v-model.trim="row.notes" class="textarea textarea-bordered min-h-24 w-full" maxlength="5000" :disabled="!canEdit" placeholder="Explain any stricter period or approved planning assumption." />
                  </label>
                </div>

                <div class="card-actions justify-end">
                  <button type="button" class="btn" :disabled="!canEdit || bulkSaving || savingId === row.procurementgroup_id || !isDirty(row) || rowIssues(row).length > 0" @click="saveRow(row)">
                    <span v-if="savingId === row.procurementgroup_id" class="loading loading-spinner loading-sm" />
                    <Icon v-else name="lucide:save" class="h-4 w-4" />
                    {{ row.id ? 'Save rule' : 'Create rule' }}
                  </button>
                </div>
              </div>
            </article>

            <div v-if="!rows.length" class="hero min-h-80 rounded-box border border-dashed border-base-300 bg-base-100">
              <div class="hero-content text-center"><div><Icon name="lucide:layers-3" class="mx-auto h-10 w-10 text-base-content/40" /><p class="mt-3 font-medium">No procurement groups are configured.</p></div></div>
            </div>
          </section>
        </main>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const { canAccess, canEdit } = useCheckPermission('procurementmethodtimelimits');
const store = useProcurementMethodTimelimitStore();
const { createOne, updateOne } = useProcurementMethodTimelimitHelper();
const dialog = ref(null);
const rows = ref([]);
const baseline = ref({});
const loading = ref(false);
const savingId = ref(null);
const bulkSaving = ref(false);
const feedback = ref(null);
const serverErrors = ref({});
let feedbackTimer = null;

const localConstraints = (code) => {
  const profiles = {
    CMB: { minimum_advertising_days: 20, international_advertising_days: 40, advertising_reference: 'S.I. 5 of 2018, section 19(1)', advertising_note: '20 working days nationally; 40 working days when international bidders are invited.' },
    RFP: { minimum_advertising_days: 12, international_advertising_days: 20, advertising_reference: 'PRAZ Procurement Manual, Module 5, Table 6', advertising_note: 'Without an EOI: 12 working days nationally and 20 internationally. An EOI requires 20/30 working days.' },
    RFQ: { minimum_advertising_days: 3, international_advertising_days: 3, advertising_reference: 'PRAZ Procurement Manual, Module 5, Table 6', advertising_note: 'A minimum of 3 working days applies to requests for quotations.' },
    RP: { minimum_advertising_days: 0, international_advertising_days: 0, advertising_reference: 'PRAZ Procurement Manual, Module 5, Table 6', advertising_note: 'No prescribed minimum; the period must still be reasonable.' },
    DP: { minimum_advertising_days: 0, international_advertising_days: 0, advertising_reference: 'S.I. 5 of 2018, section 16(1)(b)', advertising_note: 'No prescribed advertising minimum; give the selected bidder reasonable preparation time where feasible.' },
  };
  return {
    ...(profiles[String(code || '').toUpperCase()] || { minimum_advertising_days: null, international_advertising_days: null, advertising_reference: null, advertising_note: 'No verified statutory advertising profile is registered.' }),
    maximum_evaluation_days: 15,
    evaluation_reference: 'S.I. 5 of 2018, section 30(1)',
    minimum_standstill_days: 14,
    standstill_reference: 'PPDPA Act [Chapter 22:23], section 55(2)',
    spoc_note: 'Planning allowance only; it is not a statutory bidding-period minimum.',
    lead_note: 'Internal planning allowance only.',
  };
};

const showFeedback = (type, message) => {
  feedback.value = { type, message };
  if (feedbackTimer) clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => { feedback.value = null; }, 6000);
};

const planningCycleDays = (row) => ['minimum_advertising_days', 'minimum_evaluation_days', 'standstill_days', 'spoc_days']
  .reduce((total, field) => total + (Number(row[field]) || 0), 0);

const rowFields = (row) => ({
  minimum_advertising_days: row.minimum_advertising_days,
  minimum_evaluation_days: row.minimum_evaluation_days,
  standstill_days: row.standstill_days,
  spoc_days: row.spoc_days,
  minimum_cycle_days: planningCycleDays(row),
  minimum_lead_days: row.minimum_lead_days,
  notes: row.notes,
});

const isDirty = (row) => baseline.value[row.procurementgroup_id] !== JSON.stringify(rowFields(row));
const rowIssues = (row) => {
  const issues = [];
  const fields = ['minimum_advertising_days', 'minimum_evaluation_days', 'standstill_days', 'spoc_days', 'minimum_lead_days'];
  if (fields.some((field) => row[field] === null || row[field] === '')) issues.push('Complete every timetable field.');
  if (row.constraints.minimum_advertising_days === null) issues.push('No verified advertising rule is registered for this procurement method.');
  if (Number(row.minimum_advertising_days) < Number(row.constraints.minimum_advertising_days || 0)) issues.push(`Advertising cannot be below ${row.constraints.minimum_advertising_days} working days.`);
  if (Number(row.minimum_evaluation_days) < 1 || Number(row.minimum_evaluation_days) > Number(row.constraints.maximum_evaluation_days)) issues.push('Evaluation must be between 1 and 15 days.');
  if (Number(row.standstill_days) < Number(row.constraints.minimum_standstill_days)) issues.push('Standstill cannot be below 14 days.');
  if (Number(row.spoc_days) < 0 || Number(row.spoc_days) > 90) issues.push('SPOC allowance must be between 0 and 90 days.');
  if (Number(row.minimum_lead_days) < 0 || Number(row.minimum_lead_days) > 365) issues.push('Delivery lead allowance must be between 0 and 365 days.');
  return [...new Set(issues)];
};

const fieldError = (row, field) => serverErrors.value[row.procurementgroup_id]?.[field]?.[0] || '';
const completeCount = computed(() => rows.value.filter((row) => row.id && rowIssues(row).length === 0).length);
const invalidCount = computed(() => rows.value.filter((row) => rowIssues(row).length > 0).length);
const dirtyCount = computed(() => rows.value.filter(isDirty).length);

const buildRows = () => {
  const existing = new Map(store.items.filter((row) => row.procurementmethod_id === props.item.id).map((row) => [row.procurementgroup_id, row]));
  rows.value = store.procurementgroups.map((group) => {
    const current = existing.get(group.id);
    return {
      id: current?.id ?? null,
      procurementgroup_id: group.id,
      group_name: group.name,
      minimum_advertising_days: current?.minimum_advertising_days ?? null,
      minimum_evaluation_days: current?.minimum_evaluation_days ?? null,
      standstill_days: current?.standstill_days ?? null,
      spoc_days: current?.spoc_days ?? null,
      minimum_lead_days: current?.minimum_lead_days ?? null,
      notes: current?.notes ?? '',
      constraints: current?.legal_constraints ?? localConstraints(props.item.code),
    };
  });
  baseline.value = Object.fromEntries(rows.value.map((row) => [row.procurementgroup_id, JSON.stringify(rowFields(row))]));
};

const fillBaseline = (row) => {
  row.minimum_advertising_days = row.constraints.minimum_advertising_days ?? 0;
  row.minimum_evaluation_days = row.constraints.maximum_evaluation_days;
  row.standstill_days = row.constraints.minimum_standstill_days;
  if (row.spoc_days === null || row.spoc_days === '') row.spoc_days = props.item.subject_to_spoc ? 10 : 0;
  if (row.minimum_lead_days === null || row.minimum_lead_days === '') row.minimum_lead_days = 0;
  serverErrors.value[row.procurementgroup_id] = {};
};

const fillAllBaselines = () => {
  rows.value.forEach(fillBaseline);
  showFeedback('success', rows.value.length + ' procurement groups populated. Review the planning allowances, then save all changes.');
};

const openModal = async () => {
  feedback.value = null;
  serverErrors.value = {};
  loading.value = true;
  dialog.value?.showModal();
  await Promise.all([store.fetchLookups(), store.fetchAll()]);
  buildRows();
  loading.value = false;
};

const closeModal = () => dialog.value?.close();
const saveAllRows = async () => {
  const changedRows = rows.value.filter(isDirty);
  if (!changedRows.length || changedRows.some((row) => rowIssues(row).length > 0)) return;

  bulkSaving.value = true;
  serverErrors.value = {};
  let saved = 0;

  for (const row of changedRows) {
    const payload = { procurementmethod_id: props.item.id, procurementgroup_id: row.procurementgroup_id, ...rowFields(row) };
    const result = row.id ? await updateOne(row.id, payload) : await createOne(payload);
    if (result.status?.value && result.data?.value?.status === true) {
      saved += 1;
      continue;
    }

    const errorData = result.error?.value?.data;
    serverErrors.value[row.procurementgroup_id] = errorData?.errors || {};
    showFeedback('error', errorData?.message || result.error?.value?.message || 'Could not save ' + row.group_name + '.');
    break;
  }

  await store.fetchAll();
  buildRows();
  bulkSaving.value = false;
  if (saved === changedRows.length) showFeedback('success', saved + ' procurement group rules saved.');
};

const saveRow = async (row) => {
  savingId.value = row.procurementgroup_id;
  serverErrors.value[row.procurementgroup_id] = {};
  const payload = { procurementmethod_id: props.item.id, procurementgroup_id: row.procurementgroup_id, ...rowFields(row) };
  const result = row.id ? await updateOne(row.id, payload) : await createOne(payload);
  const response = result.data?.value;

  if (result.status?.value && response?.status === true) {
    showFeedback('success', response.message || `Time rule for ${row.group_name} saved.`);
    await store.fetchAll();
    buildRows();
  } else {
    const errorData = result.error?.value?.data;
    serverErrors.value[row.procurementgroup_id] = errorData?.errors || {};
    showFeedback('error', errorData?.message || result.error?.value?.message || `Failed to save the rule for ${row.group_name}.`);
  }
  savingId.value = null;
};
</script>
