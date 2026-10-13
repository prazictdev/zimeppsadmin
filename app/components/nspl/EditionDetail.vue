<template>
  <div class="mt-3 space-y-3">
    <!-- Header card with edition meta and action buttons -->
    <div class="card border border-base-200">
      <div class="card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold">{{ edition?.period ?? '...' }}</h2>
              <span :class="['badge', statusBadge(edition?.status)]">{{ edition?.status }}</span>
            </div>
            <div class="mt-1 text-sm text-base-content/60">
              {{ edition?.year }} · Quarter {{ edition?.quarter }} ·
              {{ edition?.divisions_count ?? 0 }} divisions ·
              {{ edition?.sections_count ?? 0 }} sections ·
              {{ edition?.products_count ?? 0 }} products
            </div>
            <p v-if="edition?.notes" class="mt-2 max-w-2xl text-sm text-base-content/70">{{ edition.notes }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <NsplProductImport
              v-if="canAdd && isEditable"
              :edition-id="editionId"
            />
            <NsplDivisionAdd
              v-if="canAdd && isEditable"
              :edition-id="editionId"
            />
            <NsplProductAdd
              v-if="canAdd && isEditable && hasSections"
              :edition-id="editionId"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border border-base-200">
      <div class="card-body">
        <div class="flex flex-wrap items-center gap-3">
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search by code or name..."
            class="input input-bordered w-full max-w-xs"
          />

          <select v-model="divisionInput" class="select select-bordered max-w-xs" @change="onDivisionChange">
            <option :value="''">All divisions</option>
            <option v-for="d in store.divisions" :key="d.id" :value="d.id">
              {{ d.code }} · {{ d.name }}
            </option>
          </select>

          <select v-model="sectionInput" class="select select-bordered max-w-xs" @change="onSectionChange" :disabled="!divisionInput">
            <option :value="''">All sections</option>
            <option v-for="s in scopedSections" :key="s.id" :value="s.id">
              {{ s.code }} · {{ s.name }}
            </option>
          </select>

          <select v-model="pricedInput" class="select select-bordered max-w-xs" @change="onPricedChange">
            <option value="">Priced & unpriced</option>
            <option value="priced">Only priced</option>
            <option value="unpriced">Only unpriced</option>
          </select>

          <select v-model.number="perPageInput" class="select select-bordered max-w-[8rem]" @change="onPerPageChange">
            <option :value="25">25 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
            <option :value="200">200 / page</option>
          </select>

          <span class="ml-auto text-sm text-base-content/60">
            {{ pagination.total }} {{ pagination.total === 1 ? 'product' : 'products' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Divisions / Sections management strip -->
    <details class="collapse collapse-arrow border border-base-200 bg-base-100">
      <summary class="collapse-title text-sm font-semibold">
        Manage divisions & sections ({{ store.divisions.length }} divisions)
      </summary>
      <div class="collapse-content space-y-2">
        <div v-for="d in store.divisions" :key="d.id" class="rounded-lg border border-base-200 p-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="font-mono">{{ d.code }}</span>
              <span class="ml-2 font-semibold">{{ d.name }}</span>
              <span class="ml-2 text-xs text-base-content/50">
                {{ d.category?.name ?? '—' }} · {{ d.sections_count ?? 0 }} sections · {{ d.products_count ?? 0 }} products
              </span>
            </div>
            <div class="flex items-center gap-1">
              <NsplSectionAdd
                v-if="canAdd && isEditable"
                :edition-id="editionId"
                :division="d"
              />
              <NsplDivisionEdit
                v-if="canEdit && isEditable"
                :edition-id="editionId"
                :item="d"
              />
              <NsplDivisionDelete
                v-if="canDelete && isEditable"
                :edition-id="editionId"
                :item="d"
              />
            </div>
          </div>

          <NsplSectionsList
            :division-id="d.id"
            :edition-id="editionId"
            :can-edit="canEdit && isEditable"
            :can-delete="canDelete && isEditable"
          />
        </div>
        <div v-if="!store.divisions.length" class="text-sm text-base-content/50">
          No divisions yet. Add one or import products to bootstrap the hierarchy.
        </div>
      </div>
    </details>

    <!-- Products table -->
    <div class="card border border-base-200">
      <div class="card-body">
        <div v-if="store.productsLoading" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else>
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Name</th>
                <th>Specifications</th>
                <th class="text-right">USD Price</th>
                <th>Section</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!store.products.length">
                <td colspan="7" class="text-center text-base-content/50">No products match the current filters.</td>
              </tr>
              <tr v-for="(p, i) in store.products" :key="p.id">
                <td>{{ rowOffset + i + 1 }}</td>
                <td class="font-mono whitespace-nowrap">{{ p.code }}</td>
                <td>{{ p.name }}</td>
                <td class="max-w-md text-sm text-base-content/70">{{ p.specifications || '—' }}</td>
                <td class="whitespace-nowrap text-right font-mono">
                  <span v-if="p.usd_price !== null">{{ formatPrice(p.usd_price) }}</span>
                  <span v-else class="text-base-content/40">—</span>
                </td>
                <td class="text-xs text-base-content/60">
                  <span class="font-mono">{{ p.section?.code }}</span> {{ p.section?.name }}
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-1">
                    <NsplProductEdit
                      v-if="canEdit && isEditable"
                      :edition-id="editionId"
                      :item="p"
                    />
                    <NsplProductDelete
                      v-if="canDelete && isEditable"
                      :edition-id="editionId"
                      :item="p"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="pagination.lastPage > 1" class="mt-3 flex flex-wrap items-center justify-end gap-2">
            <button class="btn btn-sm" :disabled="pagination.currentPage === 1" @click="store.fetchProductsPage(editionId, 1)">
              <Icon name="lucide:chevrons-left" class="h-4 w-4" />
            </button>
            <button
              class="btn btn-sm"
              :disabled="pagination.currentPage === 1"
              @click="store.fetchProductsPage(editionId, pagination.currentPage - 1)"
            >Prev</button>
            <span class="text-sm">Page {{ pagination.currentPage }} of {{ pagination.lastPage }}</span>
            <button
              class="btn btn-sm"
              :disabled="pagination.currentPage >= pagination.lastPage"
              @click="store.fetchProductsPage(editionId, pagination.currentPage + 1)"
            >Next</button>
            <button
              class="btn btn-sm"
              :disabled="pagination.currentPage >= pagination.lastPage"
              @click="store.fetchProductsPage(editionId, pagination.lastPage)"
            >
              <Icon name="lucide:chevrons-right" class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  editionId: { type: Number, required: true },
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useNsplStore();
const { currentEdition: edition, productsPagination: pagination } = storeToRefs(store);

const searchInput = ref(store.productsFilters.search);
const divisionInput = ref(store.productsFilters.divisionId ?? '');
const sectionInput = ref(store.productsFilters.sectionId ?? '');
const pricedInput = ref(store.productsFilters.priced);
const perPageInput = ref(store.productsPagination.perPage);

const isEditable = computed(() => edition.value?.status === 'DRAFT');
const hasSections = computed(() => store.divisions.some((d) => (d.sections_count ?? 0) > 0));
const rowOffset = computed(() => (pagination.value.currentPage - 1) * pagination.value.perPage);

const scopedSections = computed(() => {
  if (!divisionInput.value) return [];
  return store.sections.filter((s) => s.division_id === divisionInput.value);
});

let searchTimer = null;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.setProductsSearch(props.editionId, value), 300);
});

const onDivisionChange = async () => {
  sectionInput.value = '';
  if (divisionInput.value) await store.fetchSections(divisionInput.value);
  await store.setProductsDivision(props.editionId, divisionInput.value || null);
};

const onSectionChange = () => store.setProductsSection(props.editionId, sectionInput.value || null);
const onPricedChange = () => store.setProductsPriced(props.editionId, pricedInput.value);
const onPerPageChange = () => store.setProductsPerPage(props.editionId, perPageInput.value);

const statusBadge = (status) => ({
  DRAFT: 'badge-warning',
  PUBLISHED: 'badge-success',
  ARCHIVED: 'badge-ghost',
}[status] || 'badge-ghost');

const formatPrice = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
