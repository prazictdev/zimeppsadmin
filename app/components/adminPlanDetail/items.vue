<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-3">
        <span class="flex items-center gap-2 text-lg font-bold">
          <Icon name="lucide:list-checks" class="h-5 w-5 text-primary" />
          {{ heading }}
        </span>
        <div class="flex flex-wrap items-center gap-2">
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search ref or description..."
            class="input input-bordered input-sm w-64"
            @input="onSearchInput"
          />
          <button type="button" class="btn btn-outline btn-sm gap-1.5" @click="openFilters">
            <Icon name="lucide:filter" class="h-4 w-4" />
            Filters
            <span v-if="activeFilterCount > 0" class="badge badge-primary badge-xs">{{ activeFilterCount }}</span>
          </button>
        </div>
      </div>

      <!-- Filters dialog -->
      <dialog ref="filtersDialog" class="modal">
        <div class="modal-box max-w-md">
          <div class="flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-lg font-bold">
              <Icon name="lucide:filter" class="h-5 w-5 text-primary" />
              Filters
            </h3>
            <button type="button" class="btn btn-circle btn-ghost btn-sm" @click="closeFilters">
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </div>

          <div class="mt-4 space-y-4">
            <div>
              <div class="mb-1.5 text-sm font-semibold">Procurement flags</div>
              <div class="grid grid-cols-2 gap-1">
                <label
                  v-for="f in availableFilterFlags"
                  :key="f.key"
                  class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-base-200"
                >
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm"
                    :checked="filters[f.key]"
                    @change="toggleFlag(f.key)"
                  />
                  <span class="text-sm">{{ f.label }}</span>
                </label>
              </div>
            </div>

          </div>

          <div class="modal-action">
            <button
              v-if="activeFilterCount > 0"
              type="button"
              class="btn btn-ghost btn-sm"
              @click="clearFilters"
            >
              <Icon name="lucide:x" class="h-3 w-3" /> Clear all
            </button>
            <button type="button" class="btn btn-primary btn-sm" @click="closeFilters">Done</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="button" @click="closeFilters">close</button>
        </form>
      </dialog>

      <div v-if="store.groupedLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <template v-else>
        <!-- Sub-tabs: consolidated groups vs individual rows. -->
        <div v-if="mode !== 'consolidated'" class="mt-3">
          <div role="tablist" class="tabs tabs-box tabs-sm inline-flex bg-base-200/60">
            <button
              role="tab"
              type="button"
              class="tab gap-1.5"
              :class="{ 'tab-active': effectiveItemsView === 'consolidated' }"
              :disabled="!store.consolidated.length"
              @click="itemsView = 'consolidated'"
            >
              <Icon name="lucide:layers" class="h-4 w-4" />
              Consolidated
              <span class="badge badge-xs">{{ store.consolidated.length }}</span>
            </button>
            <button
              role="tab"
              type="button"
              class="tab gap-1.5"
              :class="{ 'tab-active': effectiveItemsView === 'individual' }"
              @click="itemsView = 'individual'"
            >
              <Icon name="lucide:list" class="h-4 w-4" />
              Individual
              <span class="badge badge-xs">{{ store.individualMeta.total }}</span>
            </button>
          </div>
        </div>

        <!-- Consolidated items -->
        <div v-if="effectiveItemsView === 'consolidated'" class="mt-3 space-y-2">
          <div
            v-if="!store.consolidated.length"
            class="rounded-xl border border-base-200 p-6 text-center text-sm text-base-content/50"
          >
            {{ emptyConsolidatedMessage }}
          </div>
          <AdminPlanDetailConsolidatedRow
            v-for="grp in store.consolidated"
            :key="grp.reference_no"
            :group="grp"
            :currency="currencySymbol"
          />
        </div>

        <!-- Individual items -->
        <template v-else>
          <div class="mt-3 overflow-hidden rounded-xl border border-base-200">
            <div
              v-if="!store.individual.length"
              class="p-6 text-center text-sm text-base-content/50"
            >
              {{ (searchInput || activeFilterCount > 0)
                ? 'No individual items match the current search / filters.'
                : (store.consolidated.length ? 'All matching items are consolidated.' : 'No items.') }}
            </div>
            <div v-else class="divide-y divide-base-200">
              <AdminPlanDetailPlanItemRow
                v-for="it in store.individual"
                :key="it.id"
                :item="it"
              />
            </div>
          </div>

          <div v-if="store.individualMeta.last_page > 1" class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs text-base-content/60">
              Page {{ store.individualMeta.current_page }} of {{ store.individualMeta.last_page }}
              · {{ store.individualMeta.total }} total
            </div>
            <div class="join">
              <button class="btn btn-sm join-item" :disabled="store.individualMeta.current_page <= 1 || store.groupedLoading" @click="goTo(store.individualMeta.current_page - 1)">
                <Icon name="lucide:chevron-left" />
                Prev
              </button>
              <button class="btn btn-sm join-item btn-disabled">{{ store.individualMeta.current_page }}</button>
              <button class="btn btn-sm join-item" :disabled="store.individualMeta.current_page >= store.individualMeta.last_page || store.groupedLoading" @click="goTo(store.individualMeta.current_page + 1)">
                Next
                <Icon name="lucide:chevron-right" />
              </button>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  planUuid: { type: String, required: true },
  mode: {
    type: String,
    default: 'all',
    validator: value => ['all', 'consolidated', 'exempted'].includes(value),
  },
});

const store = useAdminPlanStore();
const searchInput = ref('');
let searchTimer = null;

const itemsView = ref('consolidated');
const effectiveItemsView = computed(() =>
  (props.mode !== 'consolidated' && itemsView.value === 'consolidated' && store.consolidated.length === 0)
    ? 'individual'
    : itemsView.value,
);

const heading = computed(() => ({
  consolidated: 'Consolidated Items',
  exempted: 'Exempted Items',
})[props.mode] || 'Plan Items');

const emptyConsolidatedMessage = computed(() => {
  if (props.mode === 'exempted') return 'No consolidated groups contain exempted items.';
  if (searchInput.value || activeFilterCount.value > 0) return 'No consolidated items match the current search / filters.';
  return 'No items have been consolidated.';
});

const currencySymbol = computed(() => {
  const c = store.plan?.currency;
  if (!c) return '';
  return c.symbol ? `${c.symbol} ` : `${c.code} `;
});

// Same filter shape as the peclient items filter so the shared backend
// extractItemFilters helper picks them up without controller-side changes.
const FILTER_FLAGS = [
  { key: 'pre_qualification', label: 'Pre-Qual' },
  { key: 'eoi', label: 'EOI' },
  { key: 'spoc', label: 'SPOC' },
  { key: 'sustainable_procurement', label: 'Sustainable' },
  { key: 'affirmative_procurement', label: 'Affirmative' },
  { key: 'procurement_exemption', label: 'Exemption' },
];
const availableFilterFlags = computed(() =>
  props.mode === 'exempted'
    ? FILTER_FLAGS.filter(flag => flag.key !== 'procurement_exemption')
    : FILTER_FLAGS,
);
const filters = reactive({
  pre_qualification: false,
  eoi: false,
  spoc: false,
  sustainable_procurement: false,
  affirmative_procurement: false,
  procurement_exemption: props.mode === 'exempted',
});
const activeFilterCount = computed(() => {
  let n = 0;
  for (const f of availableFilterFlags.value) if (filters[f.key]) n++;
  return n;
});

const filtersDialog = ref(null);
const openFilters = () => filtersDialog.value?.showModal?.();
const closeFilters = () => filtersDialog.value?.close?.();

const goTo = (p) => store.loadGroupedItems(props.planUuid, p, searchInput.value, filters);

const applyFilters = () => {
  store.loadGroupedItems(props.planUuid, 1, searchInput.value, filters);
  if (props.mode === 'all') {
    store.loadFilteredTotals(props.planUuid, searchInput.value, filters);
  }
};

const toggleFlag = (key) => {
  filters[key] = !filters[key];
  applyFilters();
};

const clearFilters = () => {
  for (const f of availableFilterFlags.value) filters[f.key] = false;
  applyFilters();
};

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    store.loadGroupedItems(props.planUuid, 1, searchInput.value, filters);
    if (props.mode === 'all') {
      store.loadFilteredTotals(props.planUuid, searchInput.value, filters);
    }
  }, 300);
};

onMounted(() => store.loadGroupedItems(props.planUuid, 1, '', filters));
onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});
</script>
