<template>
  <div class="p-4 lg:p-6">
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Competition thresholds</li></ul></div>
        <h1 class="text-2xl font-bold">Domestic and international bidding thresholds</h1>
        <p class="mt-1 max-w-3xl text-sm text-base-content/65">The API uses these values to classify combined APP packages and tender packages. Values above the international threshold cannot be saved as domestic bidding.</p>
      </div>
      <button v-if="canEdit" class="btn btn-primary btn-sm" :disabled="store.loading" @click="store.autofill()">
        <Icon name="lucide:wand-sparkles" /> Apply legal baseline
      </button>
    </div>

    <div v-if="!canAccess" role="alert" class="alert alert-error"><Icon name="lucide:shield-alert" /><span>You do not have permission to access this module.</span></div>

    <template v-else>
      <div role="alert" class="alert alert-info alert-soft mb-4">
        <Icon name="lucide:landmark" />
        <span>Boundaries are inclusive: a package equal to the threshold may remain domestic; international bidding becomes mandatory only above it. APP lines sharing a reference are aggregated.</span>
      </div>

      <div class="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table class="table table-sm">
          <thead><tr><th>Procurement group</th><th>Currency</th><th>Domestic competitive from</th><th>International mandatory above</th><th>Effective from</th><th>Legal reference</th><th>Status</th><th class="text-right">Action</th></tr></thead>
          <tbody>
            <tr v-if="canAdd" class="bg-base-200/60">
              <td><select v-model.number="draft.procurementgroup_id" class="select select-sm w-52"><option :value="null">Select group</option><option v-for="group in availableGroups" :key="group.id" :value="group.id">{{ group.name }}</option></select></td>
              <td><select v-model.number="draft.currency_id" class="select select-sm w-28"><option :value="null">Currency</option><option v-for="currency in store.currencies" :key="currency.id" :value="currency.id">{{ currency.code }}</option></select></td>
              <td><input v-model.number="draft.domestic_competitive_minimum" type="number" min="0" step="0.01" class="input input-sm w-40" /></td>
              <td><input v-model.number="draft.international_bidding_threshold" type="number" min="0" step="0.01" class="input input-sm w-44" /></td>
              <td><input v-model="draft.effective_from" type="date" class="input input-sm w-40" /></td>
              <td><input v-model="draft.legal_reference" class="input input-sm w-72" placeholder="Act / regulation / section" /></td>
              <td><select v-model="draft.status" class="select select-sm w-28"><option>ACTIVE</option><option>ARCHIVED</option></select></td>
              <td class="text-right"><button class="btn btn-primary btn-sm" :disabled="!newRowValid || store.loading" @click="createRow">Add</button></td>
            </tr>
            <tr v-for="row in rows" :key="row.id">
              <td class="font-medium">{{ row.procurementgroup?.name }}</td>
              <td>{{ row.currency?.code }}</td>
              <td><input v-model.number="row.domestic_competitive_minimum" type="number" min="0" step="0.01" class="input input-sm w-40" :disabled="!canEdit" /></td>
              <td><input v-model.number="row.international_bidding_threshold" type="number" min="0" step="0.01" class="input input-sm w-44" :disabled="!canEdit" /></td>
              <td><input v-model="row.effective_from" type="date" class="input input-sm w-40" :disabled="!canEdit" /></td>
              <td><input v-model="row.legal_reference" class="input input-sm w-72" :disabled="!canEdit" /></td>
              <td><select v-model="row.status" class="select select-sm w-28" :disabled="!canEdit"><option>ACTIVE</option><option>ARCHIVED</option></select></td>
              <td><div class="flex justify-end gap-2"><button v-if="canEdit" class="btn btn-sm" :disabled="store.loading" @click="saveRow(row)">Save</button><button v-if="canDelete" class="btn btn-error btn-outline btn-sm" :disabled="store.loading" @click="store.remove(row.id)">Delete</button></div></td>
            </tr>
            <tr v-if="rows.length === 0"><td colspan="8" class="py-8 text-center text-base-content/55">No thresholds configured. Apply the legal baseline to create them.</td></tr>
          </tbody>
        </table>
      </div>
    </template>
    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Competition Scope Thresholds' });

const store = useCompetitionScopeThresholdStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('competitionscopethresholds');
const rows = ref([]);
const blankDraft = () => ({ procurementgroup_id: null, currency_id: null, domestic_competitive_minimum: 0, international_bidding_threshold: 0, effective_from: '2022-02-25', legal_reference: '', notes: null, status: 'ACTIVE' });
const draft = ref(blankDraft());
const availableGroups = computed(() => store.groups.filter(group => !store.items.some(item => Number(item.procurementgroup_id) === Number(group.id) && Number(item.currency_id) === Number(draft.value.currency_id))));
const newRowValid = computed(() => draft.value.procurementgroup_id && draft.value.currency_id && draft.value.international_bidding_threshold > draft.value.domestic_competitive_minimum && draft.value.effective_from && draft.value.legal_reference.trim());

watch(() => store.items, items => { rows.value = JSON.parse(JSON.stringify(items)); }, { deep: true, immediate: true });

const payload = row => ({ procurementgroup_id: row.procurementgroup_id, currency_id: row.currency_id, domestic_competitive_minimum: row.domestic_competitive_minimum, international_bidding_threshold: row.international_bidding_threshold, effective_from: row.effective_from?.slice(0, 10), legal_reference: row.legal_reference, notes: row.notes || null, status: row.status });
const createRow = async () => { if (await store.create(payload(draft.value))) draft.value = blankDraft(); };
const saveRow = row => store.update(row.id, payload(row));

onMounted(() => { if (canAccess) store.fetchAll(); });
</script>
