<template>
  <div v-if="canAccess">
    <button class="btn btn-primary btn-sm" @click="openModal"><Icon name="lucide:scale" class="h-4 w-4" /><span class="hidden md:block">Time rules</span></button>
    <dialog ref="dialog" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none bg-base-200 p-0">
        <header class="sticky top-0 z-30 border-b border-base-300 bg-base-100 px-5 py-3 shadow-sm lg:px-7">
          <div class="flex items-center justify-between gap-4">
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid size-10 shrink-0 place-items-center rounded-box bg-primary/10 text-primary"><Icon name="lucide:scale" class="h-5 w-5" /></span>
              <div class="min-w-0"><div class="flex flex-wrap items-center gap-2"><h2 class="truncate text-lg font-bold">{{ item.name }}</h2><span v-if="item.code" class="badge badge-outline badge-sm">{{ item.code }}</span></div><p class="text-xs text-base-content/60">Domestic and international statutory timetable controls</p></div>
            </div>
            <button type="button" class="btn btn-ghost btn-circle btn-sm" aria-label="Close time rules" @click="closeModal"><Icon name="lucide:x" class="h-5 w-5" /></button>
          </div>
        </header>

        <main class="mx-auto w-full max-w-[1800px] space-y-3 p-4 lg:px-7">
          <section class="flex flex-col gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div class="flex min-w-0 items-start gap-3 text-sm"><Icon name="lucide:landmark" class="mt-0.5 h-4 w-4 shrink-0 text-info" /><p><strong>Legal floors are enforced.</strong> <span class="text-base-content/65">Domestic and international advertising periods are saved separately; evaluation is capped at 15 days and standstill cannot be below 14 days.</span><span v-if="String(item.code || '').toUpperCase() === 'RFP'" class="ml-1 text-info">RFP figures are without EOI; EOI schedules apply the higher 20/30-day floors automatically.</span></p></div>
            <div class="flex shrink-0 flex-wrap items-center gap-2">
              <span class="badge badge-ghost">{{ rows.length }} groups</span><span v-if="invalidCount" class="badge badge-error">{{ invalidCount }} need correction</span><span v-if="dirtyCount" class="badge badge-warning">{{ dirtyCount }} unsaved</span>
              <button type="button" class="btn btn-outline btn-sm" :disabled="!canEdit || loading || bulkSaving" @click="fillAllBaselines"><Icon name="lucide:wand-sparkles" class="h-4 w-4" /> Legal baseline</button>
              <button type="button" class="btn btn-primary btn-sm" :disabled="!canEdit || bulkSaving || dirtyCount === 0 || invalidCount > 0" @click="saveAllRows"><span v-if="bulkSaving" class="loading loading-spinner loading-xs" /><Icon v-else name="lucide:save-all" class="h-4 w-4" /> Save all</button>
            </div>
          </section>

          <div v-if="feedback" role="alert" :class="['alert py-2.5', feedback.type === 'success' ? 'alert-success' : 'alert-error']"><Icon :name="feedback.type === 'success' ? 'lucide:check-circle' : 'lucide:alert-circle'" class="h-4 w-4" /><span class="text-sm">{{ feedback.message }}</span><button type="button" class="btn btn-ghost btn-xs" @click="feedback = null"><Icon name="lucide:x" class="h-4 w-4" /></button></div>
          <div v-if="loading" class="flex min-h-64 items-center justify-center rounded-box border border-base-300 bg-base-100"><span class="loading loading-spinner loading-lg text-primary" /></div>

          <section v-else class="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm">
            <div class="overflow-x-auto">
              <table class="table table-sm table-zebra min-w-[1450px]">
                <thead><tr class="bg-base-200 text-xs uppercase tracking-wide text-base-content/65">
                  <th class="sticky left-0 z-20 w-64 bg-base-200">Procurement group</th>
                  <th class="w-32 text-center"><span class="badge badge-success badge-outline badge-sm">Domestic</span><div class="mt-1 normal-case">Advertising</div></th>
                  <th class="w-32 text-center"><span class="badge badge-info badge-outline badge-sm">International</span><div class="mt-1 normal-case">Advertising</div></th>
                  <th class="w-28 text-center">Evaluation</th><th class="w-28 text-center">Standstill</th><th class="w-24 text-center">SPOC</th><th class="w-32 text-center">Cycle D / I</th><th class="w-28 text-center">Lead</th><th class="min-w-64">Administrative note</th><th class="sticky right-0 z-20 w-28 bg-base-200 text-right">Action</th>
                </tr></thead>
                <tbody>
                  <tr v-for="row in rows" :key="row.procurementgroup_id" :class="rowIssues(row).length ? 'bg-error/5' : ''">
                    <td class="sticky left-0 z-10 bg-base-100"><div class="font-semibold">{{ row.group_name }}</div><div class="mt-1 flex flex-wrap gap-1"><span v-if="rowIssues(row).length" class="badge badge-error badge-xs">Needs correction</span><span v-else-if="row.id" class="badge badge-success badge-xs">Configured</span><span v-else class="badge badge-warning badge-xs">Not configured</span><span v-if="isDirty(row)" class="badge badge-outline badge-xs">Unsaved</span></div></td>
                    <td><input v-model.number="row.minimum_advertising_days" type="number" :min="row.constraints.minimum_advertising_days ?? 0" max="365" class="input input-sm w-full text-right" :class="fieldError(row, 'minimum_advertising_days') ? 'input-error' : ''" :disabled="!canEdit" aria-label="Domestic advertising working days"><div class="mt-1 text-center text-[11px] text-base-content/50">min {{ row.constraints.minimum_advertising_days ?? '—' }} working days</div></td>
                    <td><input v-model.number="row.international_advertising_days" type="number" :min="row.constraints.international_advertising_days ?? 0" max="365" class="input input-sm w-full text-right" :class="fieldError(row, 'international_advertising_days') ? 'input-error' : ''" :disabled="!canEdit" aria-label="International advertising working days"><div class="mt-1 text-center text-[11px] text-base-content/50">min {{ row.constraints.international_advertising_days ?? '—' }} working days</div></td>
                    <td><input v-model.number="row.minimum_evaluation_days" type="number" min="1" :max="row.constraints.maximum_evaluation_days" class="input input-sm w-full text-right" :class="fieldError(row, 'minimum_evaluation_days') ? 'input-error' : ''" :disabled="!canEdit" aria-label="Evaluation days"><div class="mt-1 text-center text-[11px] text-base-content/50">max 15 days</div></td>
                    <td><input v-model.number="row.standstill_days" type="number" :min="row.constraints.minimum_standstill_days" max="365" class="input input-sm w-full text-right" :class="fieldError(row, 'standstill_days') ? 'input-error' : ''" :disabled="!canEdit" aria-label="Standstill days"><div class="mt-1 text-center text-[11px] text-base-content/50">min 14 days</div></td>
                    <td><input v-model.number="row.spoc_days" type="number" min="0" max="90" class="input input-sm w-full text-right" :class="fieldError(row, 'spoc_days') ? 'input-error' : ''" :disabled="!canEdit" aria-label="SPOC allowance days"><div class="mt-1 text-center text-[11px] text-base-content/50">allowance</div></td>
                    <td class="text-center font-mono text-sm font-semibold"><span class="text-success">{{ domesticCycleDays(row) }}</span><span class="mx-1 text-base-content/35">/</span><span class="text-info">{{ internationalCycleDays(row) }}</span><div class="mt-1 font-sans text-[11px] font-normal text-base-content/50">days</div></td>
                    <td><input v-model.number="row.minimum_lead_days" type="number" min="0" max="365" class="input input-sm w-full text-right" :class="fieldError(row, 'minimum_lead_days') ? 'input-error' : ''" :disabled="!canEdit" aria-label="Delivery lead allowance"><div class="mt-1 text-center text-[11px] text-base-content/50">allowance</div></td>
                    <td><input v-model.trim="row.notes" class="input input-sm w-full" maxlength="5000" :disabled="!canEdit" placeholder="Optional planning assumption" aria-label="Administrative note"><p v-if="rowIssues(row).length" class="mt-1 text-xs text-error">{{ rowIssues(row).join(' ') }}</p></td>
                    <td class="sticky right-0 z-10 bg-base-100 text-right"><div class="flex justify-end gap-1"><button type="button" class="btn btn-ghost btn-square btn-sm" title="Restore legal baseline" :disabled="!canEdit || bulkSaving || savingId === row.procurementgroup_id" @click="fillBaseline(row)"><Icon name="lucide:rotate-ccw" class="h-4 w-4" /></button><button type="button" class="btn btn-primary btn-square btn-sm" title="Save row" :disabled="!canEdit || bulkSaving || savingId === row.procurementgroup_id || !isDirty(row) || rowIssues(row).length > 0" @click="saveRow(row)"><span v-if="savingId === row.procurementgroup_id" class="loading loading-spinner loading-xs" /><Icon v-else name="lucide:save" class="h-4 w-4" /></button></div></td>
                  </tr>
                  <tr v-if="!rows.length"><td colspan="10" class="py-12 text-center text-base-content/55">No procurement groups are configured.</td></tr>
                </tbody>
              </table>
            </div>
            <footer class="flex flex-wrap items-center justify-between gap-2 border-t border-base-300 px-4 py-2 text-xs text-base-content/60"><span><strong class="text-success">D</strong> domestic cycle · <strong class="text-info">I</strong> international cycle</span><span>{{ item.code }} · {{ rows[0]?.constraints?.advertising_reference || 'Verified legal profile required' }}</span></footer>
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
const dialog = ref(null); const rows = ref([]); const baseline = ref({}); const loading = ref(false); const savingId = ref(null); const bulkSaving = ref(false); const feedback = ref(null); const serverErrors = ref({}); let feedbackTimer = null;

const localConstraints = (code) => {
  const profiles = {
    CMB: { minimum_advertising_days: 20, international_advertising_days: 40, advertising_reference: 'S.I. 5 of 2018, section 19(1)' },
    RFP: { minimum_advertising_days: 12, international_advertising_days: 20, advertising_reference: 'PRAZ Procurement Manual, Module 5, Table 6' },
    RFQ: { minimum_advertising_days: 3, international_advertising_days: 3, advertising_reference: 'PRAZ Procurement Manual, Module 5, Table 6' },
    RP: { minimum_advertising_days: 0, international_advertising_days: 0, advertising_reference: 'PRAZ Procurement Manual, Module 5, Table 6' },
    DP: { minimum_advertising_days: 0, international_advertising_days: 0, advertising_reference: 'S.I. 5 of 2018, section 16(1)(b)' },
  };
  return { ...(profiles[String(code || '').toUpperCase()] || { minimum_advertising_days: null, international_advertising_days: null, advertising_reference: null }), maximum_evaluation_days: 15, minimum_standstill_days: 14 };
};
const showFeedback = (type, message) => { feedback.value = { type, message }; if (feedbackTimer) clearTimeout(feedbackTimer); feedbackTimer = setTimeout(() => { feedback.value = null; }, 6000); };
const cycleDays = (row, field) => [field, 'minimum_evaluation_days', 'standstill_days', 'spoc_days'].reduce((total, key) => total + (Number(row[key]) || 0), 0);
const domesticCycleDays = (row) => cycleDays(row, 'minimum_advertising_days');
const internationalCycleDays = (row) => cycleDays(row, 'international_advertising_days');
const rowFields = (row) => ({ minimum_advertising_days: row.minimum_advertising_days, international_advertising_days: row.international_advertising_days, minimum_evaluation_days: row.minimum_evaluation_days, standstill_days: row.standstill_days, spoc_days: row.spoc_days, minimum_cycle_days: domesticCycleDays(row), minimum_lead_days: row.minimum_lead_days, notes: row.notes });
const isDirty = (row) => baseline.value[row.procurementgroup_id] !== JSON.stringify(rowFields(row));
const rowIssues = (row) => {
  const issues = []; const fields = ['minimum_advertising_days', 'international_advertising_days', 'minimum_evaluation_days', 'standstill_days', 'spoc_days', 'minimum_lead_days'];
  if (fields.some((field) => row[field] === null || row[field] === '')) issues.push('Complete every timetable field.');
  if (row.constraints.minimum_advertising_days === null || row.constraints.international_advertising_days === null) issues.push('No verified advertising rule is registered.');
  if (Number(row.minimum_advertising_days) < Number(row.constraints.minimum_advertising_days || 0)) issues.push(`Domestic advertising must be at least ${row.constraints.minimum_advertising_days} working days.`);
  if (Number(row.international_advertising_days) < Number(row.constraints.international_advertising_days || 0)) issues.push(`International advertising must be at least ${row.constraints.international_advertising_days} working days.`);
  if (Number(row.international_advertising_days) < Number(row.minimum_advertising_days)) issues.push('International advertising cannot be shorter than domestic advertising.');
  if (Number(row.minimum_evaluation_days) < 1 || Number(row.minimum_evaluation_days) > Number(row.constraints.maximum_evaluation_days)) issues.push('Evaluation must be between 1 and 15 days.');
  if (Number(row.standstill_days) < Number(row.constraints.minimum_standstill_days)) issues.push('Standstill cannot be below 14 days.');
  if (Number(row.spoc_days) < 0 || Number(row.spoc_days) > 90) issues.push('SPOC allowance must be between 0 and 90 days.');
  if (Number(row.minimum_lead_days) < 0 || Number(row.minimum_lead_days) > 365) issues.push('Lead allowance must be between 0 and 365 days.');
  return [...new Set(issues)];
};
const fieldError = (row, field) => serverErrors.value[row.procurementgroup_id]?.[field]?.[0] || '';
const invalidCount = computed(() => rows.value.filter((row) => rowIssues(row).length > 0).length);
const dirtyCount = computed(() => rows.value.filter(isDirty).length);
const buildRows = () => {
  const existing = new Map(store.items.filter((row) => row.procurementmethod_id === props.item.id).map((row) => [row.procurementgroup_id, row]));
  rows.value = store.procurementgroups.map((group) => { const current = existing.get(group.id); return { id: current?.id ?? null, procurementgroup_id: group.id, group_name: group.name, minimum_advertising_days: current?.minimum_advertising_days ?? null, international_advertising_days: current?.international_advertising_days ?? null, minimum_evaluation_days: current?.minimum_evaluation_days ?? null, standstill_days: current?.standstill_days ?? null, spoc_days: current?.spoc_days ?? null, minimum_lead_days: current?.minimum_lead_days ?? null, notes: current?.notes ?? '', constraints: current?.legal_constraints ?? localConstraints(props.item.code) }; });
  baseline.value = Object.fromEntries(rows.value.map((row) => [row.procurementgroup_id, JSON.stringify(rowFields(row))]));
};
const fillBaseline = (row) => { row.minimum_advertising_days = row.constraints.minimum_advertising_days ?? 0; row.international_advertising_days = row.constraints.international_advertising_days ?? row.minimum_advertising_days; row.minimum_evaluation_days = row.constraints.maximum_evaluation_days; row.standstill_days = row.constraints.minimum_standstill_days; if (row.spoc_days === null || row.spoc_days === '') row.spoc_days = props.item.subject_to_spoc ? 10 : 0; if (row.minimum_lead_days === null || row.minimum_lead_days === '') row.minimum_lead_days = 0; serverErrors.value[row.procurementgroup_id] = {}; };
const fillAllBaselines = () => { rows.value.forEach(fillBaseline); showFeedback('success', `${rows.value.length} groups populated with domestic and international legal baselines.`); };
const openModal = async () => { feedback.value = null; serverErrors.value = {}; loading.value = true; dialog.value?.showModal(); await Promise.all([store.fetchLookups(), store.fetchAll()]); buildRows(); loading.value = false; };
const closeModal = () => dialog.value?.close();
const persistRow = (row) => { const payload = { procurementmethod_id: props.item.id, procurementgroup_id: row.procurementgroup_id, ...rowFields(row) }; return row.id ? updateOne(row.id, payload) : createOne(payload); };
const saveAllRows = async () => { const changedRows = rows.value.filter(isDirty); if (!changedRows.length || changedRows.some((row) => rowIssues(row).length > 0)) return; bulkSaving.value = true; serverErrors.value = {}; let saved = 0; for (const row of changedRows) { const result = await persistRow(row); if (result.status?.value && result.data?.value?.status === true) { saved += 1; continue; } const errorData = result.error?.value?.data; serverErrors.value[row.procurementgroup_id] = errorData?.errors || {}; showFeedback('error', errorData?.message || result.error?.value?.message || `Could not save ${row.group_name}.`); break; } await store.fetchAll(); buildRows(); bulkSaving.value = false; if (saved === changedRows.length) showFeedback('success', `${saved} procurement group rules saved.`); };
const saveRow = async (row) => { savingId.value = row.procurementgroup_id; serverErrors.value[row.procurementgroup_id] = {}; const result = await persistRow(row); const response = result.data?.value; if (result.status?.value && response?.status === true) { showFeedback('success', response.message || `Time rule for ${row.group_name} saved.`); await store.fetchAll(); buildRows(); } else { const errorData = result.error?.value?.data; serverErrors.value[row.procurementgroup_id] = errorData?.errors || {}; showFeedback('error', errorData?.message || result.error?.value?.message || `Failed to save ${row.group_name}.`); } savingId.value = null; };
</script>
