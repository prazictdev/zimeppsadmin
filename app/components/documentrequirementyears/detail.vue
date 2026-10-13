<template>
  <div class="mt-3 space-y-3">
    <!-- Header -->
    <div class="card border border-base-200">
      <div class="card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-3">
              <h2 class="text-2xl font-bold">{{ year?.year ?? '...' }}</h2>
              <span :class="['badge', statusBadge(year?.status)]">{{ year?.status }}</span>
            </div>
            <div v-if="year?.label" class="text-base-content/80">{{ year.label }}</div>
            <div class="mt-1 text-sm text-base-content/60">
              {{ year?.items_count ?? 0 }} required documents
              <span v-if="year?.effective_from || year?.effective_to">
                · {{ formatDate(year?.effective_from) }} → {{ formatDate(year?.effective_to) }}
              </span>
            </div>
            <p v-if="year?.notes" class="mt-2 max-w-2xl text-sm text-base-content/70">{{ year.notes }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <DocumentrequirementyearsItemAdd
              v-if="canAdd && isEditable"
              :year-id="yearId"
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
            placeholder="Search by document name..."
            class="input input-bordered w-full max-w-xs"
          />
          <select v-model.number="perPageInput" class="select select-bordered max-w-[8rem]" @change="onPerPageChange">
            <option :value="25">25 / page</option>
            <option :value="50">50 / page</option>
            <option :value="100">100 / page</option>
            <option :value="200">200 / page</option>
          </select>
          <span class="ml-auto text-sm text-base-content/60">
            {{ pagination.total }} {{ pagination.total === 1 ? 'document' : 'documents' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Items table -->
    <div class="card border border-base-200">
      <div class="card-body">
        <div v-if="store.itemsLoading" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg"></span>
        </div>
        <div v-else>
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Document</th>
                <th>Document Type</th>
                <th>Notes</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!store.items.length">
                <td colspan="5" class="text-center text-base-content/50">No documents required for this year yet.</td>
              </tr>
              <tr v-for="(item, i) in store.items" :key="item.id">
                <td>{{ rowOffset + i + 1 }}</td>
                <td>
                  <span class="font-medium">{{ item.document?.name }}</span>
                </td>
                <td class="text-sm text-base-content/70">{{ item.document?.documenttype?.name || '—' }}</td>
                <td class="max-w-md text-sm text-base-content/70">{{ item.notes || '—' }}</td>
                <td class="text-right">
                  <div class="flex justify-end gap-1">
                    <DocumentrequirementyearsItemEdit
                      v-if="canEdit && isEditable"
                      :year-id="yearId"
                      :item="item"
                    />
                    <DocumentrequirementyearsItemDelete
                      v-if="canDelete && isEditable"
                      :year-id="yearId"
                      :item="item"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="pagination.lastPage > 1" class="mt-3 flex flex-wrap items-center justify-end gap-2">
            <button class="btn btn-sm" :disabled="pagination.currentPage === 1" @click="store.fetchItemsPage(yearId, 1)">
              <Icon name="lucide:chevrons-left" class="h-4 w-4" />
            </button>
            <button
              class="btn btn-sm"
              :disabled="pagination.currentPage === 1"
              @click="store.fetchItemsPage(yearId, pagination.currentPage - 1)"
            >Prev</button>
            <span class="text-sm">Page {{ pagination.currentPage }} of {{ pagination.lastPage }}</span>
            <button
              class="btn btn-sm"
              :disabled="pagination.currentPage >= pagination.lastPage"
              @click="store.fetchItemsPage(yearId, pagination.currentPage + 1)"
            >Next</button>
            <button
              class="btn btn-sm"
              :disabled="pagination.currentPage >= pagination.lastPage"
              @click="store.fetchItemsPage(yearId, pagination.lastPage)"
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
  yearId: { type: Number, required: true },
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useDocumentRequirementYearStore();
const { currentYear: year, itemsPagination: pagination } = storeToRefs(store);

const searchInput = ref(store.itemsFilters.search);
const perPageInput = ref(store.itemsPagination.perPage);

const isEditable = computed(() => year.value && year.value.status !== 'ARCHIVED');
const rowOffset = computed(() => (pagination.value.currentPage - 1) * pagination.value.perPage);

let searchTimer = null;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.setItemsSearch(props.yearId, value), 300);
});

const onPerPageChange = () => store.setItemsPerPage(props.yearId, perPageInput.value);

const statusBadge = (status) => ({
  DRAFT: 'badge-warning',
  ACTIVE: 'badge-success',
  ARCHIVED: 'badge-ghost',
}[status] || 'badge-ghost');

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');
</script>
