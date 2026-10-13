<template>
  <div>
    <button class="btn btn-ghost btn-sm" @click="openModal">
      <Icon name="lucide:eye" />
      <span class="hidden md:block">View</span>
    </button>
    <dialog :id="`view_procurementgroup_modal_${item.id}`" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">
            {{ item.code }} — {{ item.name }}
          </h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('view_procurementgroup_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <div role="tablist" class="tabs tabs-bordered mt-3">
          <a
            role="tab"
            :class="['tab', activeTab === 'criteria' ? 'tab-active' : '']"
            @click="activeTab = 'criteria'"
          >Evaluation Criteria</a>
          <a
            role="tab"
            :class="['tab', activeTab === 'opening' ? 'tab-active' : '']"
            @click="activeTab = 'opening'"
          >Bid Opening Types</a>
          <a
            role="tab"
            :class="['tab', activeTab === 'methods' ? 'tab-active' : '']"
            @click="activeTab = 'methods'"
          >Procurement Methods</a>
          <a
            role="tab"
            :class="['tab', activeTab === 'selection' ? 'tab-active' : '']"
            @click="activeTab = 'selection'; loadSelectionMethods()"
          >Selection Methods</a>
        </div>

        <div v-if="loading" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <!-- Evaluation Criteria -->
        <div v-else-if="activeTab === 'criteria'" class="mt-3">
          <div class="flex items-center justify-between border-b border-base-200 pb-2">
            <span class="text-sm text-base-content/70">Select the criteria that apply to this group.</span>
            <span class="badge badge-ghost">
              {{ selectedCriteriaIds.size }} of {{ allCriteria.length }} assigned
            </span>
          </div>
          <div v-if="!allCriteria.length" class="py-6 text-center text-base-content/50">
            No evaluation criteria have been defined yet.
          </div>
          <div v-else class="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            <label
              v-for="c in allCriteria"
              :key="c.id"
              class="flex cursor-pointer items-center gap-3 rounded border border-base-200 px-3 py-2 hover:bg-base-200"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-primary"
                :checked="selectedCriteriaIds.has(c.id)"
                :disabled="!canEdit"
                @change="toggleCriterion(c.id)"
              />
              <div class="flex flex-col">
                <span class="font-mono text-sm">{{ c.code }}</span>
                <span class="text-sm">{{ c.name }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Bid Opening Types -->
        <div v-else-if="activeTab === 'opening'" class="mt-3">
          <div class="flex items-center justify-between border-b border-base-200 pb-2">
            <span class="text-sm text-base-content/70">Select the bid opening types allowed for this group.</span>
            <span class="badge badge-ghost">
              {{ selectedOpeningIds.size }} of {{ activeOpeningTypes.length }} assigned
            </span>
          </div>
          <div v-if="!activeOpeningTypes.length" class="py-6 text-center text-base-content/50">
            No active bid opening types have been defined yet.
          </div>
          <div v-else class="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            <label
              v-for="o in activeOpeningTypes"
              :key="o.id"
              class="flex cursor-pointer items-center gap-3 rounded border border-base-200 px-3 py-2 hover:bg-base-200"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-primary"
                :checked="selectedOpeningIds.has(o.id)"
                :disabled="!canEdit"
                @change="toggleOpening(o.id)"
              />
              <div class="flex flex-col">
                <span class="font-mono text-sm">{{ o.code }}</span>
                <span class="text-sm">{{ o.name }}</span>
              </div>
            </label>
          </div>
        </div>

        <div v-else-if="activeTab === 'methods'" class="mt-3">
          <div class="flex items-center justify-between border-b border-base-200 pb-2">
            <span class="text-sm text-base-content/70">Assign the methods allowed for this group and select the method automatically applied by default.</span>
            <span class="badge badge-ghost">{{ selectedMethodIds.size }} assigned</span>
          </div>
          <div v-if="!allMethods.length" class="py-6 text-center text-base-content/50">No procurement methods have been defined yet.</div>
          <div v-else class="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
            <div v-for="method in allMethods" :key="method.id" class="flex items-center gap-3 rounded border border-base-200 px-3 py-2">
              <input type="checkbox" class="checkbox checkbox-primary" :checked="selectedMethodIds.has(method.id)" :disabled="!canEdit" @change="toggleMethod(method.id)">
              <div class="min-w-0 flex-1"><span class="font-mono text-sm">{{ method.code }}</span><span class="ml-2 text-sm">{{ method.name }}</span></div>
              <label v-if="selectedMethodIds.has(method.id)" class="flex cursor-pointer items-center gap-2 text-xs">
                <input v-model.number="defaultMethodId" type="radio" name="default-procurement-method" class="radio radio-primary radio-xs" :value="method.id" :disabled="!canEdit">
                Default
              </label>
            </div>
          </div>
          <p class="mt-2 text-xs text-base-content/55">The default method is automatically selected by tender clients. Leave the default empty when officers must choose among the assigned methods.</p>
        </div>

        <div v-else class="mt-3 space-y-4">
          <div class="border-b border-base-200 pb-3">
            <p class="text-sm text-base-content/70">Assign the bid-selection methods available for each procurement method in this group.</p>
            <label class="fieldset mt-3">
              <span class="fieldset-legend">Procurement method</span>
              <select v-model.number="selectionProcurementMethodId" class="select select-bordered w-full" :disabled="selectionLoading" @change="loadSelectionMethods">
                <option :value="null" disabled>Select an assigned procurement method</option>
                <option v-for="method in assignedProcurementMethods" :key="method.id" :value="method.id">{{ method.code }} — {{ method.name }}</option>
              </select>
            </label>
          </div>
          <div v-if="selectionLoading" class="flex justify-center py-8"><span class="loading loading-spinner" /></div>
          <div v-else-if="!selectionProcurementMethodId" class="py-6 text-center text-sm text-base-content/50">Select a procurement method first.</div>
          <div v-else-if="!availableSelectionMethods.length" class="py-6 text-center text-sm text-base-content/50">No active selection methods are available for this procurement group.</div>
          <div v-else class="max-h-80 space-y-2 overflow-y-auto pr-1">
            <div v-for="method in availableSelectionMethods" :key="method.id" class="rounded border border-base-200 px-3 py-3">
              <div class="flex items-center gap-3">
                <input type="checkbox" class="checkbox checkbox-primary" :checked="selectedSelectionIds.has(method.id)" :disabled="!canEdit" @change="toggleSelectionMethod(method.id)">
                <div class="min-w-0 flex-1"><span class="font-mono text-sm">{{ method.code }}</span><span class="ml-2 text-sm">{{ method.name }}</span></div>
                <label v-if="selectedSelectionIds.has(method.id)" class="flex cursor-pointer items-center gap-2 text-xs"><input v-model.number="defaultSelectionId" type="radio" name="default-selection-method" class="radio radio-primary radio-xs" :value="method.id" :disabled="!canEdit">Default</label>
              </div>
              <div v-if="selectedSelectionIds.has(method.id)" class="mt-3 flex flex-wrap gap-4 pl-9 text-xs">
                <label class="flex cursor-pointer items-center gap-2"><input v-model="selectionFlags[method.id].requires_justification" type="checkbox" class="checkbox checkbox-xs" :disabled="!canEdit">Requires justification</label>
                <label class="flex cursor-pointer items-center gap-2"><input v-model="selectionFlags[method.id].requires_approval" type="checkbox" class="checkbox checkbox-xs" :disabled="!canEdit">Requires approval</label>
              </div>
            </div>
          </div>
          <div v-if="selectionError" role="alert" class="alert alert-error py-2 text-sm">{{ selectionError }}</div>
          <p class="text-xs text-base-content/55">Tender clients read this assignment after the officer selects the procurement group and procurement method.</p>
        </div>

        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('view_procurementgroup_modal_${item.id}').close()`"
          >Close</button>
          <button
            v-if="canEdit"
            class="btn btn-primary"
            :disabled="submitting || loading"
            @click="handleSave"
          >
            <span v-if="submitting">Saving...</span>
            <span v-else>Save</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
});

const store = useProcurementGroupStore();
const criteriaStore = useEvaluationcriterionStore();
const openingStore = useBidopeningtypeStore();
const methodStore = useProcurementMethodStore();
const groupHelper = useProcurementGroupHelper();
const toast = useToast();

const loading = ref(false);
const submitting = ref(false);
const activeTab = ref('criteria');
const selectedCriteriaIds = ref(new Set());
const selectedOpeningIds = ref(new Set());
const selectedMethodIds = ref(new Set());
const defaultMethodId = ref(null);
const bidEvaluationMethods = ref([]);
const selectionProcurementMethodId = ref(null);
const selectedSelectionIds = ref(new Set());
const defaultSelectionId = ref(null);
const selectionFlags = ref({});
const selectionLoading = ref(false);
const selectionError = ref('');
const assignedProcurementMethods = ref([]);

const allCriteria = computed(() => criteriaStore.items);
const activeOpeningTypes = computed(() =>
  openingStore.items.filter((o) => o.status === 'ACTIVE'),
);
const allMethods = computed(() => methodStore.items);
const availableSelectionMethods = computed(() => bidEvaluationMethods.value.filter((method) => {
  if (method.status !== 'ACTIVE') return false;
  const consultancyOnly = ['QBS', 'QCBS'].includes(method.code);
  return props.item.code === 'CONSULTANCY' ? consultancyOnly : !consultancyOnly;
}));

const openModal = async () => {
  loading.value = true;
  activeTab.value = 'criteria';
  try {
    const [group, evaluationMethodsResponse] = await Promise.all([
      store.findOne(props.item.id),
      groupHelper.getBidEvaluationMethods(),
      criteriaStore.items.length ? Promise.resolve() : criteriaStore.fetchAll(),
      openingStore.items.length ? Promise.resolve() : openingStore.fetchAll(),
      methodStore.items.length ? Promise.resolve() : methodStore.fetchAll(),
    ]);
    selectedCriteriaIds.value = new Set((group?.evaluation_criteria ?? []).map((c) => c.id));
    selectedOpeningIds.value = new Set((group?.bidopening_types ?? []).map((o) => o.id));
    selectedMethodIds.value = new Set((group?.procurement_methods ?? []).map((method) => method.id));
    defaultMethodId.value = (group?.procurement_methods ?? []).find((method) => method.pivot?.is_default)?.id ?? null;
    assignedProcurementMethods.value = group?.procurement_methods ?? [];
    bidEvaluationMethods.value = evaluationMethodsResponse.data.value?.data ?? [];
    selectionProcurementMethodId.value = defaultMethodId.value ?? assignedProcurementMethods.value[0]?.id ?? null;
    selectedSelectionIds.value = new Set();
    defaultSelectionId.value = null;
    selectionFlags.value = {};
    selectionError.value = '';
  } finally {
    loading.value = false;
  }
  document.getElementById(`view_procurementgroup_modal_${props.item.id}`).showModal();
};

const toggleCriterion = (id) => {
  const next = new Set(selectedCriteriaIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedCriteriaIds.value = next;
};

const toggleOpening = (id) => {
  const next = new Set(selectedOpeningIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedOpeningIds.value = next;
};

const toggleMethod = (id) => {
  const next = new Set(selectedMethodIds.value);
  if (next.has(id)) {
    next.delete(id);
    if (defaultMethodId.value === id) defaultMethodId.value = null;
  } else {
    next.add(id);
  }
  selectedMethodIds.value = next;
};

const loadSelectionMethods = async () => {
  if (!selectionProcurementMethodId.value) return;
  selectionLoading.value = true;
  selectionError.value = '';
  const { data, error } = await groupHelper.getSelectionMethods(props.item.id, selectionProcurementMethodId.value);
  const mappings = error.value ? [] : data.value?.data ?? [];
  selectedSelectionIds.value = new Set(mappings.filter(mapping => mapping.status === 'ACTIVE').map(mapping => mapping.bidevaluationmethod_id));
  defaultSelectionId.value = mappings.find(mapping => mapping.status === 'ACTIVE' && mapping.is_default)?.bidevaluationmethod_id ?? null;
  selectionFlags.value = Object.fromEntries(availableSelectionMethods.value.map(method => {
    const mapping = mappings.find(item => item.bidevaluationmethod_id === method.id);
    return [method.id, {
      requires_justification: Boolean(mapping?.requires_justification),
      requires_approval: Boolean(mapping?.requires_approval),
    }];
  }));
  if (error.value) selectionError.value = error.value?.data?.message || 'Unable to load selection methods.';
  selectionLoading.value = false;
};

const toggleSelectionMethod = (id) => {
  const next = new Set(selectedSelectionIds.value);
  if (next.has(id)) {
    next.delete(id);
    if (defaultSelectionId.value === id) defaultSelectionId.value = next.values().next().value ?? null;
  } else {
    next.add(id);
    selectionFlags.value[id] ??= { requires_justification: false, requires_approval: false };
    defaultSelectionId.value ??= id;
  }
  selectedSelectionIds.value = next;
};

const handleSave = async () => {
  submitting.value = true;
  try {
    if (activeTab.value === 'criteria') {
      const result = await store.syncEvaluationCriteria(props.item.id, [...selectedCriteriaIds.value]);
      if (result) {
        document.getElementById(`view_procurementgroup_modal_${props.item.id}`).close();
      }
    } else if (activeTab.value === 'opening') {
      const result = await store.syncBidopeningTypes(props.item.id, [...selectedOpeningIds.value]);
      if (result) {
        document.getElementById(`view_procurementgroup_modal_${props.item.id}`).close();
      }
    } else if (activeTab.value === 'methods') {
      const result = await store.syncProcurementMethods(props.item.id, [...selectedMethodIds.value], defaultMethodId.value);
      if (result) document.getElementById(`view_procurementgroup_modal_${props.item.id}`).close();
    } else {
      selectionError.value = '';
      if (!selectionProcurementMethodId.value || selectedSelectionIds.value.size === 0 || !defaultSelectionId.value) {
        selectionError.value = 'Select at least one selection method and mark exactly one as the default.';
        return;
      }
      const mappings = [...selectedSelectionIds.value].map(id => ({
        bidevaluationmethod_id: id,
        is_default: id === defaultSelectionId.value,
        requires_justification: Boolean(selectionFlags.value[id]?.requires_justification),
        requires_approval: Boolean(selectionFlags.value[id]?.requires_approval),
        status: 'ACTIVE',
      }));
      const { status, error } = await groupHelper.syncSelectionMethods(props.item.id, selectionProcurementMethodId.value, mappings);
      if (status.value) {
        toast.success({ title: 'Assignment saved', message: 'Selection method assignment saved.', position: 'topRight', layout: 2 });
        document.getElementById(`view_procurementgroup_modal_${props.item.id}`).close();
      } else {
        selectionError.value = Object.values(error.value?.data?.errors || {}).flat().join(' ') || error.value?.data?.message || 'Failed to save selection methods.';
      }
    }
  } finally {
    submitting.value = false;
  }
};
</script>
