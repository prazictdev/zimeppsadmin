<template>
  <div class="space-y-6 p-4 sm:p-6">
    <div class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body gap-3 p-4 sm:p-5">
        <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Procurement legal rules</li></ul></div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><h1 class="text-xl font-bold">Procurement legal rule sets</h1><p class="mt-1 text-sm text-base-content/60">Versioned thresholds and conditions used by strict automatic procurement-method selection.</p></div>
          <button v-if="canAdd" type="button" class="btn btn-primary btn-sm" @click="openNewRuleSet"><Icon name="lucide:plus" class="h-4 w-4" /> New draft rule set</button>
        </div>
      </div>
    </div>

    <div v-if="message" class="alert" :class="messageOk ? 'alert-success' : 'alert-error'"><Icon :name="messageOk ? 'lucide:check-circle-2' : 'lucide:alert-triangle'" class="h-5 w-5" /><span>{{ message }}</span></div>
    <div v-if="!canAccess" class="alert alert-error"><Icon name="lucide:shield-alert" class="h-5 w-5" /><span>You do not have permission to access procurement legal rules.</span></div>

    <template v-else>
      <div class="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <section class="card h-fit border border-base-200 bg-base-100 shadow-sm">
          <div class="card-body gap-3 p-4">
            <div class="flex items-center justify-between"><h2 class="font-semibold">Rule sets</h2><span class="badge badge-ghost">{{ ruleSets.length }}</span></div>
            <div v-if="loading" class="flex items-center gap-2 py-6 text-sm text-base-content/50"><span class="loading loading-spinner loading-sm" /> Loading…</div>
            <button v-for="item in ruleSets" v-else :key="item.uuid" type="button" class="rounded-lg border p-3 text-left transition hover:border-primary/40" :class="selected?.uuid === item.uuid ? 'border-primary bg-primary/5' : 'border-base-200'" @click="selectRuleSet(item)">
              <div class="flex items-start justify-between gap-2"><div><p class="font-medium">{{ item.name }}</p><p class="font-mono text-xs text-base-content/50">{{ item.code }}</p></div><span class="badge badge-sm" :class="statusClass(item.status)">{{ item.status }}</span></div>
              <p class="mt-2 text-xs text-base-content/60">Effective {{ formatDate(item.effective_from) }}<template v-if="item.effective_to"> to {{ formatDate(item.effective_to) }}</template></p>
            </button>
          </div>
        </section>

        <section v-if="selected" class="card border border-base-200 bg-base-100 shadow-sm">
          <div class="card-body gap-5 p-4 sm:p-5">
            <header class="flex flex-col gap-3 border-b border-base-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div><h2 class="text-lg font-semibold">{{ selected.name }}</h2><p class="text-sm text-base-content/60">{{ selected.legal_instrument || 'No legal instrument recorded' }}</p></div>
              <div class="flex gap-2"><button v-if="canEdit && selected.status === 'DRAFT'" type="button" class="btn btn-outline btn-sm" @click="openEditRuleSet"><Icon name="lucide:pencil" class="h-4 w-4" /> Edit</button><button v-if="canEdit && selected.status === 'DRAFT'" type="button" class="btn btn-success btn-sm" @click="activate"><Icon name="lucide:shield-check" class="h-4 w-4" /> Activate verified set</button></div>
            </header>

            <div class="alert border border-warning/30 bg-warning/10"><Icon name="lucide:scale" class="h-5 w-5 text-warning" /><div><p class="font-medium">Activation is a legal-control action</p><p class="text-sm">Only activate after current amendments, PPRA circulars, currency treatment, thresholds and SPOC rules have been verified.</p></div></div>

            <div class="flex items-center justify-between"><div><h3 class="font-semibold">Method-selection rules</h3><p class="text-xs text-base-content/50">Rules are evaluated by priority, scope and exact value boundaries.</p></div><button v-if="canAdd && selected.status === 'DRAFT'" type="button" class="btn btn-primary btn-sm" @click="openNewMethodRule"><Icon name="lucide:plus" class="h-4 w-4" /> Add rule</button></div>

            <div class="overflow-x-auto rounded-lg border border-base-200">
              <table class="table table-sm">
                <thead><tr><th>Priority</th><th>Method</th><th>Group</th><th>Currency</th><th>Value range</th><th>Conditions</th><th /></tr></thead>
                <tbody>
                  <tr v-for="rule in methodRules" :key="rule.id"><td>{{ rule.priority }}</td><td>{{ rule.procurementmethod?.name || methodName(rule.procurementmethod_id) }}</td><td>{{ rule.procurementgroup?.name || groupName(rule.procurementgroup_id) }}</td><td class="font-mono">{{ rule.currency_code }}</td><td class="font-mono text-xs">{{ range(rule) }}</td><td><code class="text-xs">{{ compactConditions(rule.conditions) }}</code></td><td><div v-if="selected.status === 'DRAFT'" class="flex"><button v-if="canEdit" type="button" class="btn btn-ghost btn-xs btn-square" @click="openEditMethodRule(rule)"><Icon name="lucide:pencil" class="h-3.5 w-3.5" /></button><button v-if="canDelete" type="button" class="btn btn-ghost btn-xs btn-square text-error" @click="removeMethodRule(rule)"><Icon name="lucide:trash-2" class="h-3.5 w-3.5" /></button></div></td></tr>
                  <tr v-if="methodRules.length === 0"><td colspan="7" class="py-8 text-center text-base-content/50">No method-selection rules configured.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <div v-else class="card border border-dashed border-base-300 bg-base-100"><div class="card-body items-center justify-center py-20 text-center text-base-content/50"><Icon name="lucide:book-open-check" class="h-10 w-10" /><p>Select a legal rule set to inspect its method rules.</p></div></div>
      </div>
    </template>

    <dialog ref="ruleSetDialog" class="modal"><div class="modal-box max-w-2xl"><h3 class="text-lg font-semibold">{{ editingRuleSet ? 'Edit rule set' : 'New draft rule set' }}</h3><form class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="saveRuleSet"><label class="fieldset"><span class="fieldset-legend">Code</span><input v-model.trim="ruleSetForm.code" class="input input-bordered w-full" required></label><label class="fieldset"><span class="fieldset-legend">Name</span><input v-model.trim="ruleSetForm.name" class="input input-bordered w-full" required></label><label class="fieldset sm:col-span-2"><span class="fieldset-legend">Legal instrument</span><input v-model.trim="ruleSetForm.legal_instrument" class="input input-bordered w-full"></label><label class="fieldset"><span class="fieldset-legend">Effective from</span><input v-model="ruleSetForm.effective_from" type="date" class="input input-bordered w-full" required></label><label class="fieldset"><span class="fieldset-legend">Effective to</span><input v-model="ruleSetForm.effective_to" type="date" class="input input-bordered w-full"></label><label class="fieldset sm:col-span-2"><span class="fieldset-legend">Validation notes</span><textarea v-model.trim="ruleSetForm.notes" class="textarea textarea-bordered min-h-24 w-full" /></label><div class="modal-action sm:col-span-2"><button type="button" class="btn btn-ghost" @click="ruleSetDialog?.close()">Cancel</button><button type="submit" class="btn btn-primary" :disabled="saving">Save draft</button></div></form></div><form method="dialog" class="modal-backdrop"><button>close</button></form></dialog>

    <dialog ref="methodRuleDialog" class="modal">
      <div class="modal-box max-w-3xl">
        <h3 class="text-lg font-semibold">{{ editingMethodRule ? 'Edit method rule' : 'Add method rule' }}</h3>
        <form class="mt-4 grid gap-3 sm:grid-cols-2" @submit.prevent="saveMethodRule">
          <label class="fieldset"><span class="fieldset-legend">Procurement method</span><select v-model.number="methodRuleForm.procurementmethod_id" class="select select-bordered w-full" required><option :value="null" disabled>Select</option><option v-for="method in methods" :key="method.id" :value="method.id">{{ method.code }} — {{ method.name }}</option></select></label>
          <label class="fieldset"><span class="fieldset-legend">Procurement group</span><select v-model.number="methodRuleForm.procurementgroup_id" class="select select-bordered w-full"><option :value="null">All groups</option><option v-for="group in groups" :key="group.id" :value="group.id">{{ group.code }} — {{ group.name }}</option></select></label>
          <label class="fieldset"><span class="fieldset-legend">Currency</span><input v-model.trim="methodRuleForm.currency_code" maxlength="3" class="input input-bordered w-full uppercase" required></label>
          <label class="fieldset"><span class="fieldset-legend">Priority</span><input v-model.number="methodRuleForm.priority" type="number" min="1" class="input input-bordered w-full" required></label>
          <label class="fieldset"><span class="fieldset-legend">Minimum value</span><input v-model.number="methodRuleForm.min_value" type="number" min="0" step="0.01" class="input input-bordered w-full"></label>
          <label class="fieldset"><span class="fieldset-legend">Maximum value</span><input v-model.number="methodRuleForm.max_value" type="number" min="0" step="0.01" class="input input-bordered w-full"></label>
          <label class="fieldset"><span class="fieldset-legend">Market scope</span><select v-model="conditionForm.market_scope" class="select select-bordered w-full"><option value="">Any</option><option value="DOMESTIC">Domestic</option><option value="INTERNATIONAL">International</option></select></label>
          <label class="fieldset"><span class="fieldset-legend">PE class</span><select v-model="conditionForm.pe_class" class="select select-bordered w-full"><option value="">Any</option><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></label>
          <label class="fieldset"><span class="fieldset-legend">Exceptional ground code</span><input v-model.trim="conditionForm.exception_ground_code" class="input input-bordered w-full"></label>
          <label class="fieldset"><span class="fieldset-legend">Required evidence types</span><input v-model.trim="conditionForm.required_evidence" class="input input-bordered w-full" placeholder="JUSTIFICATION, MARKET_REPORT"></label>
          <div class="modal-action sm:col-span-2"><button type="button" class="btn btn-ghost" @click="methodRuleDialog?.close()">Cancel</button><button type="submit" class="btn btn-primary" :disabled="saving">Save rule</button></div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Procurement Legal Rules' });
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('procurementlegalrules');
const legal = useProcurementLegalRuleSetHelper();
const { getProcurementMethods } = useProcurementMethodHelper();
const { getProcurementGroups } = useProcurementGroupHelper();
const loading = ref(true);
const saving = ref(false);
const ruleSets = ref([]);
const selected = ref(null);
const methodRules = ref([]);
const methods = ref([]);
const groups = ref([]);
const message = ref('');
const messageOk = ref(true);
const ruleSetDialog = ref(null);
const methodRuleDialog = ref(null);
const editingRuleSet = ref(false);
const editingMethodRule = ref(null);
const ruleSetForm = reactive({ code: '', name: '', legal_instrument: '', effective_from: '', effective_to: '', status: 'DRAFT', notes: '' });
const methodRuleForm = reactive({ procurementmethod_id: null, procurementgroup_id: null, currency_code: 'USD', min_value: null, max_value: null, priority: 100 });
const conditionForm = reactive({ market_scope: '', pe_class: '', exception_ground_code: '', required_evidence: '' });

function statusClass(status) { return status === 'ACTIVE' ? 'badge-success' : status === 'RETIRED' ? 'badge-neutral' : 'badge-warning'; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString('en-ZW', { dateStyle: 'medium' }) : '—'; }
function methodName(id) { return methods.value.find(item => item.id === id)?.name || `#${id}`; }
function groupName(id) { return id ? groups.value.find(item => item.id === id)?.name || `#${id}` : 'All'; }
function range(rule) { return `${rule.min_value ?? '0'} – ${rule.max_value ?? 'No limit'}`; }
function compactConditions(value) { const parsed = typeof value === 'string' ? JSON.parse(value || '{}') : value || {}; return Object.keys(parsed).length ? JSON.stringify(parsed) : 'Any'; }

async function load() {
  loading.value = true;
  try {
    const [sets, methodResult, groupResult] = await Promise.all([legal.getRuleSets(), getProcurementMethods(), getProcurementGroups()]);
    ruleSets.value = sets.data.value?.data ?? [];
    methods.value = methodResult.data.value?.data ?? [];
    groups.value = groupResult.data.value?.data ?? [];
    if (selected.value) {
      const refreshed = ruleSets.value.find(item => item.uuid === selected.value.uuid);
      if (refreshed) await selectRuleSet(refreshed);
    }
  } finally { loading.value = false; }
}

async function selectRuleSet(item) {
  selected.value = item;
  const { data } = await legal.getRuleSet(item.uuid);
  selected.value = data.value?.data ?? item;
  methodRules.value = selected.value.method_rules ?? selected.value.methodRules ?? [];
}

function openNewRuleSet() { editingRuleSet.value = false; Object.assign(ruleSetForm, { code: '', name: '', legal_instrument: '', effective_from: new Date().toISOString().slice(0, 10), effective_to: '', status: 'DRAFT', notes: '' }); ruleSetDialog.value?.showModal?.(); }
function openEditRuleSet() { editingRuleSet.value = true; Object.assign(ruleSetForm, { code: selected.value.code, name: selected.value.name, legal_instrument: selected.value.legal_instrument || '', effective_from: String(selected.value.effective_from).slice(0, 10), effective_to: selected.value.effective_to ? String(selected.value.effective_to).slice(0, 10) : '', status: selected.value.status, notes: selected.value.notes || '' }); ruleSetDialog.value?.showModal?.(); }
function openNewMethodRule() { editingMethodRule.value = null; Object.assign(methodRuleForm, { procurementmethod_id: null, procurementgroup_id: null, currency_code: 'USD', min_value: null, max_value: null, priority: 100 }); Object.assign(conditionForm, { market_scope: '', pe_class: '', exception_ground_code: '', required_evidence: '' }); methodRuleDialog.value?.showModal?.(); }
function openEditMethodRule(rule) { editingMethodRule.value = rule; const conditions = typeof rule.conditions === 'string' ? JSON.parse(rule.conditions || '{}') : rule.conditions || {}; Object.assign(methodRuleForm, { procurementmethod_id: rule.procurementmethod_id, procurementgroup_id: rule.procurementgroup_id, currency_code: rule.currency_code, min_value: rule.min_value == null ? null : Number(rule.min_value), max_value: rule.max_value == null ? null : Number(rule.max_value), priority: Number(rule.priority) }); Object.assign(conditionForm, { market_scope: conditions.market_scopes?.[0] || '', pe_class: conditions.pe_classes?.[0] || '', exception_ground_code: conditions.exception_ground_codes?.[0] || '', required_evidence: (conditions.required_evidence || []).join(', ') }); methodRuleDialog.value?.showModal?.(); }

async function handle(result, success) { messageOk.value = result.status.value; message.value = result.status.value ? result.data.value?.message || success : result.error.value?.data?.message || 'The operation failed.'; return result.status.value; }
async function saveRuleSet() { saving.value = true; try { const payload = { ...ruleSetForm, effective_to: ruleSetForm.effective_to || null }; const result = editingRuleSet.value ? await legal.updateRuleSet(selected.value.uuid, payload) : await legal.createRuleSet(payload); if (await handle(result, 'Rule set saved.')) { ruleSetDialog.value?.close(); selected.value = result.data.value?.data ?? null; await load(); } } finally { saving.value = false; } }
async function activate() { saving.value = true; try { const result = await legal.activateRuleSet(selected.value.uuid); if (await handle(result, 'Verified legal rule set activated.')) await load(); } finally { saving.value = false; } }
async function saveMethodRule() { saving.value = true; try { const conditions = {}; if (conditionForm.market_scope) conditions.market_scopes = [conditionForm.market_scope]; if (conditionForm.pe_class) conditions.pe_classes = [conditionForm.pe_class]; if (conditionForm.exception_ground_code) conditions.exception_ground_codes = [conditionForm.exception_ground_code]; const evidence = conditionForm.required_evidence.split(',').map(value => value.trim().toUpperCase()).filter(Boolean); if (evidence.length) conditions.required_evidence = evidence; const payload = { ...methodRuleForm, min_value: methodRuleForm.min_value === '' ? null : methodRuleForm.min_value, max_value: methodRuleForm.max_value === '' ? null : methodRuleForm.max_value, conditions }; const result = editingMethodRule.value ? await legal.updateMethodRule(selected.value.uuid, editingMethodRule.value.id, payload) : await legal.createMethodRule(selected.value.uuid, payload); if (await handle(result, 'Method rule saved.')) { methodRuleDialog.value?.close(); await selectRuleSet(selected.value); } } finally { saving.value = false; } }
async function removeMethodRule(rule) { if (!confirm('Delete this draft method-selection rule?')) return; const result = await legal.deleteMethodRule(selected.value.uuid, rule.id); if (await handle(result, 'Method rule deleted.')) await selectRuleSet(selected.value); }

onMounted(() => { if (canAccess.value) load(); else loading.value = false; });
</script>
