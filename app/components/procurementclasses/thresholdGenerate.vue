<template>
  <button type="button" class="btn btn-outline btn-sm" @click="open">Generate from S.I.</button>
  <dialog :id="`threshold-generator-${classId}`" ref="dialog" class="modal" :aria-labelledby="`threshold-generator-title-${classId}`" @cancel="saving && $event.preventDefault()">
    <div class="modal-box max-w-5xl">
      <h3 :id="`threshold-generator-title-${classId}`" class="text-lg font-bold">Review statutory thresholds · Class {{ className }}</h3>
      <p class="mt-2 text-sm">Review the RFQ limits and SPOC thresholds below. Saving applies rows marked Add or Update.</p>
      <p v-if="loading" class="mt-4 text-sm" role="status">Loading preview…</p>
      <p v-if="error" class="mt-4 text-sm text-error" role="alert">{{ error }}</p>
      <div v-if="preview" class="mt-4 overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr><th scope="col">Type / method</th><th scope="col">Procurement group</th><th scope="col" class="text-right">Current</th><th scope="col" class="text-right">Proposed (USD)</th><th scope="col">Change</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in preview.rows" :key="row.key">
              <td class="whitespace-nowrap">{{ [row.kind, row.method !== row.kind ? row.method : null].filter(Boolean).join(' · ') || '—' }}</td>
              <th scope="row" class="font-medium">{{ row.group }}</th>
              <td class="text-right tabular-nums">{{ row.current_amount == null ? '—' : `${formatAmount(row.current_amount)} ${row.current_currency ?? '(no currency)'}` }}</td>
              <td class="text-right tabular-nums">{{ row.proposed_amount == null ? '—' : formatAmount(row.proposed_amount) }}</td>
              <td>
                <span class="font-medium">{{ actionLabels[row.action] }}</span>
                <p v-if="row.reason" class="text-xs">{{ row.reason }}</p>
                <a v-if="row.reference" :href="preview.source_url" target="_blank" rel="noopener noreferrer" class="text-xs underline">{{ row.reference }}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="preview && !hasChanges" class="mt-3 text-sm">There are no changes to save.</p>
      <p v-if="preview && !permitted" class="mt-3 text-sm" role="status">You need permission for each change in this preview.</p>
      <div class="modal-action">
        <form method="dialog"><button class="btn btn-sm" :disabled="saving">Close</button></form>
        <button type="button" class="btn btn-outline btn-sm" :disabled="saving || loading" @click="load">Reload preview</button>
        <button type="button" class="btn btn-primary btn-sm" :disabled="saving || loading || stale || !hasChanges || !permitted" @click="save">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
const props = defineProps({
  classId: { type: Number, required: true },
  className: { type: String, required: true },
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
});

const dialog = ref(null);
const preview = ref(null);
const loading = ref(false);
const saving = ref(false);
const stale = ref(false);
const error = ref('');
const client = useSanctumClient();
const store = useProcurementClassStore();
const toast = useToast();
const endpoint = computed(() => `/api/v1/procurement-classes/${props.classId}/thresholds/generate`);
const hasChanges = computed(() => preview.value?.rows.some(row => ['add', 'update'].includes(row.action)));
const permitted = computed(() => preview.value?.rows.every(row =>
  (row.action !== 'add' || props.canAdd) && (row.action !== 'update' || props.canEdit),
));
const actionLabels = { add: 'Add', update: 'Update', unchanged: 'Unchanged', review: 'Review manually' };
const formatAmount = amount => Number(amount).toLocaleString('en-ZW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

async function load() {
  loading.value = true;
  error.value = '';
  preview.value = null;
  stale.value = false;
  try {
    preview.value = (await client(endpoint.value)).data;
  } catch (err) {
    error.value = err.data?.message || 'Could not load the threshold preview.';
  } finally {
    loading.value = false;
  }
}

function open() {
  dialog.value.showModal();
  if (!loading.value) load();
}

async function save() {
  if (saving.value || loading.value || stale.value || !hasChanges.value || !permitted.value) return;
  saving.value = true;
  error.value = '';
  try {
    const response = await client(endpoint.value, { method: 'POST', body: { version: preview.value.version } });
    toast.success({ title: 'Thresholds saved', message: `${response.data.added} added, ${response.data.updated} updated.`, position: 'topRight', layout: 2 });
    dialog.value.close();
    await store.fetchThresholds(props.classId);
  } catch (err) {
    stale.value = (err.statusCode ?? err.response?.status) === 409;
    error.value = err.data?.message || 'Could not save the thresholds.';
  } finally {
    saving.value = false;
  }
}
</script>
