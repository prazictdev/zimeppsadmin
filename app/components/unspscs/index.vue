<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">UNSPSC Codes</span>
        <div class="flex gap-2">
          <UnspscsImport v-if="canAdd" />
          <UnspscsAdd v-if="canAdd" />
        </div>
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by code or name..."
          class="input input-bordered w-full max-w-xs"
        />
        <select v-model="statusInput" class="select select-bordered max-w-xs" @change="onStatusChange">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select v-model.number="perPageInput" class="select select-bordered max-w-[8rem]" @change="onPerPageChange">
          <option :value="25">25 / page</option>
          <option :value="50">50 / page</option>
          <option :value="100">100 / page</option>
          <option :value="200">200 / page</option>
        </select>
        <span class="ml-auto text-sm text-base-content/60">
          {{ pagination.total }} {{ pagination.total === 1 ? 'row' : 'rows' }}
        </span>
      </div>

      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.items.length">
              <td colspan="5" class="text-center text-base-content/50">No UNSPSC codes found.</td>
            </tr>
            <tr v-for="(item, i) in store.items" :key="item.id">
              <td>{{ rowOffset + i + 1 }}</td>
              <td class="font-mono">{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td>
                <span :class="['badge badge-sm', item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost']">
                  {{ item.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <UnspscsEdit v-if="canEdit" :item="item" />
                  <UnspscsDelete v-if="canDelete && item.status === 'ACTIVE'" :item="item" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination.lastPage > 1" class="mt-3 flex flex-wrap items-center justify-end gap-2">
          <button class="btn btn-sm" :disabled="pagination.currentPage === 1" @click="store.fetchPage(1)">
            <Icon name="lucide:chevrons-left" class="h-4 w-4" />
          </button>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage === 1"
            @click="store.fetchPage(pagination.currentPage - 1)"
          >Prev</button>
          <span class="text-sm">
            Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
          </span>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="store.fetchPage(pagination.currentPage + 1)"
          >Next</button>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="store.fetchPage(pagination.lastPage)"
          >
            <Icon name="lucide:chevrons-right" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useUnspscStore();
const { pagination } = storeToRefs(store);

defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const searchInput = ref(store.filters.search);
const statusInput = ref(store.filters.status);
const perPageInput = ref(store.pagination.perPage);

const rowOffset = computed(() => (pagination.value.currentPage - 1) * pagination.value.perPage);

// Debounce search → 300ms
let searchTimer = null;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.setSearch(value), 300);
});

const onStatusChange = () => store.setStatus(statusInput.value);
const onPerPageChange = () => store.setPerPage(perPageInput.value);
</script>
