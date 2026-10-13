<template>
  <section class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 pb-3">
        <div><h1 class="text-xl font-bold">Exemption Types</h1><p class="text-sm text-base-content/60">Configure the exemption grounds available to procurement entities.</p></div>
        <button v-if="canAdd" class="btn btn-primary btn-sm" @click="openForm()"><Icon name="lucide:plus" /> New type</button>
      </div>
      <div class="mt-3 flex flex-wrap gap-3"><input v-model.trim="search" class="input max-w-sm" placeholder="Search types" /><select v-model="status" class="select max-w-xs"><option value="">All statuses</option><option>ACTIVE</option><option>ARCHIVED</option></select></div>
      <div class="overflow-x-auto"><table class="table table-zebra mt-3"><thead><tr><th>Name</th><th>Code</th><th>Behaviour</th><th>Required terms</th><th>Status</th><th></th></tr></thead><tbody>
        <tr v-if="!filtered.length"><td colspan="6" class="text-center text-base-content/50">No exemption types found.</td></tr>
        <tr v-for="item in filtered" :key="item.id"><td><p class="font-medium">{{ item.name }}</p><p class="max-w-md text-xs text-base-content/60">{{ item.description || '—' }}</p></td><td class="font-mono text-xs">{{ item.code }}</td><td><span class="badge badge-outline badge-sm">{{ readable(item.behavior_handler) }}</span></td><td><div class="flex max-w-md flex-wrap gap-1"><span v-for="field in item.terms_schema || []" :key="field.key" class="badge badge-ghost badge-sm">{{ field.label || field.key }}{{ field.required ? ' *' : '' }}</span><span v-if="!item.terms_schema?.length" class="text-base-content/40">None</span></div></td><td><span class="badge badge-sm" :class="item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost'">{{ item.status }}</span></td><td class="text-right"><div class="join"><button v-if="canEdit" class="btn btn-xs join-item" @click="openForm(item)"><Icon name="lucide:pencil" /></button><button v-if="canDelete && item.status === 'ACTIVE'" class="btn btn-error btn-xs join-item" @click="archive(item)"><Icon name="lucide:archive" /></button></div></td></tr>
      </tbody></table></div>
    </div>

    <dialog ref="formDialog" class="modal"><div class="modal-box max-w-3xl"><h2 class="text-lg font-bold">{{ editing ? 'Edit' : 'New' }} exemption type</h2><form class="mt-4 space-y-4" @submit.prevent="save">
      <div class="grid gap-3 md:grid-cols-2"><label class="fieldset"><span class="fieldset-legend">Name</span><input v-model.trim="form.name" class="input w-full" maxlength="255" required /></label><label class="fieldset"><span class="fieldset-legend">Code</span><input v-model.trim="form.code" class="input w-full font-mono" maxlength="100" placeholder="E.G. CUSTOM_WAIVER" required /></label></div>
      <label class="fieldset"><span class="fieldset-legend">Description</span><textarea v-model.trim="form.description" class="textarea w-full" rows="3" /></label>
      <div class="grid gap-3 md:grid-cols-2"><label class="fieldset"><span class="fieldset-legend">System behaviour</span><select v-model="form.behavior_handler" class="select w-full" required @change="applyHandlerTemplate"><option v-for="option in handlers" :key="option.value" :value="option.value">{{ option.label }}</option></select></label><label class="fieldset"><span class="fieldset-legend">Status</span><select v-model="form.status" class="select w-full"><option>ACTIVE</option><option>ARCHIVED</option></select></label></div>
      <div class="rounded-xl border border-base-200 p-4"><div class="flex items-center justify-between"><div><h3 class="font-semibold">Information requested from the PE</h3><p class="text-xs text-base-content/60">These fields appear when this exemption type is selected.</p></div><button type="button" class="btn btn-outline btn-xs" @click="addField"><Icon name="lucide:plus" /> Field</button></div>
        <div v-if="!form.terms_schema.length" class="py-5 text-center text-sm text-base-content/50">No additional terms.</div>
        <div v-for="(field, index) in form.terms_schema" :key="index" class="mt-3 grid items-end gap-2 rounded-lg bg-base-200/50 p-3 md:grid-cols-12"><label class="fieldset md:col-span-3"><span class="fieldset-legend">Key</span><input v-model.trim="field.key" class="input input-sm w-full font-mono" required /></label><label class="fieldset md:col-span-4"><span class="fieldset-legend">Label</span><input v-model.trim="field.label" class="input input-sm w-full" required /></label><label class="fieldset md:col-span-2"><span class="fieldset-legend">Type</span><select v-model="field.type" class="select select-sm w-full"><option>text</option><option>textarea</option><option>number</option><option>email</option><option>date</option><option>boolean</option></select></label><label class="label md:col-span-2"><input v-model="field.required" type="checkbox" class="checkbox checkbox-sm" /> Required</label><button type="button" class="btn btn-ghost btn-xs text-error md:col-span-1" @click="form.terms_schema.splice(index, 1)"><Icon name="lucide:trash-2" /></button></div>
      </div>
      <div class="modal-action"><button type="button" class="btn" @click="formDialog.close()">Cancel</button><button class="btn btn-primary" :disabled="saving"><span v-if="saving" class="loading loading-spinner loading-xs" /> Save</button></div>
    </form></div><form method="dialog" class="modal-backdrop"><button>close</button></form></dialog>
  </section>
</template>

<script setup>
const props = defineProps({ canAdd: Boolean, canEdit: Boolean, canDelete: Boolean });
const store = useExemptionTypeStore();
const search = ref(''), status = ref(''), formDialog = ref(null), editing = ref(null), saving = ref(false);
const handlers = [
  { value: 'SHORT_BIDDING_PERIOD', label: 'Short bidding period' }, { value: 'RFQ_ABOVE_THRESHOLD', label: 'RFQ above threshold' },
  { value: 'SPOC_WAIVER', label: 'SPOC waiver' }, { value: 'UNREGISTERED_SINGLE_BIDDER', label: 'Unregistered single bidder' }, { value: 'INFORMATIONAL', label: 'Informational only' },
];
const templates = {
  SHORT_BIDDING_PERIOD: [{ key: 'normal_advertising_days', label: 'Normal advertising days', type: 'number', required: false }, { key: 'requested_advertising_days', label: 'Requested advertising days', type: 'number', required: true }],
  UNREGISTERED_SINGLE_BIDDER: [{ key: 'legal_name', label: 'Legal name', type: 'text', required: true }, { key: 'registration_identifier', label: 'Registration identifier', type: 'text', required: false }, { key: 'country', label: 'Country', type: 'text', required: true }, { key: 'address', label: 'Address', type: 'textarea', required: false }, { key: 'contact_name', label: 'Contact name', type: 'text', required: true }, { key: 'contact_email', label: 'Contact email', type: 'email', required: true }],
  RFQ_ABOVE_THRESHOLD: [], SPOC_WAIVER: [], INFORMATIONAL: [],
};
const blank = () => ({ code: '', name: '', description: '', behavior_handler: 'INFORMATIONAL', terms_schema: [], status: 'ACTIVE' });
const form = reactive(blank());
const clonePlain = value => JSON.parse(JSON.stringify(value));
const readable = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
const filtered = computed(() => store.items.filter(item => (!status.value || item.status === status.value) && (!search.value || [item.name, item.code, item.description].some(value => String(value || '').toLowerCase().includes(search.value.toLowerCase())))));
const openForm = item => { editing.value = item || null; Object.assign(form, blank(), item ? { ...item, terms_schema: clonePlain(item.terms_schema || []) } : {}); formDialog.value.showModal(); };
const applyHandlerTemplate = () => { if (!editing.value && !form.terms_schema.length) form.terms_schema = clonePlain(templates[form.behavior_handler] || []); };
const addField = () => form.terms_schema.push({ key: '', label: '', type: 'text', required: false });
const save = async () => { saving.value = true; const payload = { ...form, code: form.code.toUpperCase().replace(/[^A-Z0-9_]+/g, '_') }; const ok = editing.value ? await store.update(editing.value.id, payload) : await store.create(payload); saving.value = false; if (ok) formDialog.value.close(); };
const archive = async item => { if (window.confirm(`Archive “${item.name}”? Existing exemption records will retain it.`)) await store.archive(item.id); };
</script>
