<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Document Requirements (Yearly)</span>
        <DocumentrequirementyearsAdd v-if="canAdd" />
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by year or label..."
          class="input input-bordered w-full max-w-xs"
        />
        <select v-model="statusInput" class="select select-bordered max-w-xs" @change="onStatusChange">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <span class="ml-auto text-sm text-base-content/60">
          {{ pagination.total }} {{ pagination.total === 1 ? 'year' : 'years' }}
        </span>
      </div>

      <div v-if="store.yearsLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Year</th>
              <th>Label</th>
              <th>Items</th>
              <th>Effective</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.years.length">
              <td colspan="7" class="text-center text-base-content/50">No yearly requirement records yet.</td>
            </tr>
            <tr v-for="(item, i) in store.years" :key="item.id">
              <td>{{ rowOffset + i + 1 }}</td>
              <td class="font-mono">
                <NuxtLink :to="`/documentrequirementyears/${item.id}`" class="link link-primary">{{ item.year }}</NuxtLink>
              </td>
              <td>{{ item.label || '—' }}</td>
              <td>{{ item.items_count ?? 0 }}</td>
              <td class="text-sm text-base-content/70">
                <span v-if="item.effective_from || item.effective_to">
                  {{ formatDate(item.effective_from) }} → {{ formatDate(item.effective_to) }}
                </span>
                <span v-else>—</span>
              </td>
              <td>
                <span :class="['badge badge-sm', statusBadge(item.status)]">{{ item.status }}</span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <NuxtLink :to="`/documentrequirementyears/${item.id}`" class="btn btn-ghost btn-sm">
                    <Icon name="lucide:eye" />
                    <span class="hidden md:block">Open</span>
                  </NuxtLink>
                  <DocumentrequirementyearsActivate
                    v-if="canEdit && item.status !== 'ACTIVE'"
                    :item="item"
                  />
                  <DocumentrequirementyearsClone v-if="canAdd" :item="item" />
                  <DocumentrequirementyearsEdit v-if="canEdit && item.status !== 'ARCHIVED'" :item="item" />
                  <DocumentrequirementyearsArchive
                    v-if="canDelete && item.status !== 'ARCHIVED'"
                    :item="item"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination.lastPage > 1" class="mt-3 flex flex-wrap items-center justify-end gap-2">
          <button class="btn btn-sm" :disabled="pagination.currentPage === 1" @click="store.fetchYearsPage(1)">
            <Icon name="lucide:chevrons-left" class="h-4 w-4" />
          </button>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage === 1"
            @click="store.fetchYearsPage(pagination.currentPage - 1)"
          >Prev</button>
          <span class="text-sm">Page {{ pagination.currentPage }} of {{ pagination.lastPage }}</span>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="store.fetchYearsPage(pagination.currentPage + 1)"
          >Next</button>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="store.fetchYearsPage(pagination.lastPage)"
          >
            <Icon name="lucide:chevrons-right" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useDocumentRequirementYearStore();
const { yearsPagination: pagination } = storeToRefs(store);

defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const searchInput = ref(store.yearsFilters.search);
const statusInput = ref(store.yearsFilters.status);

const rowOffset = computed(() => (pagination.value.currentPage - 1) * pagination.value.perPage);

let searchTimer = null;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.setYearsSearch(value), 300);
});

const onStatusChange = () => store.setYearsStatus(statusInput.value);

const statusBadge = (status) => ({
  DRAFT: 'badge-warning',
  ACTIVE: 'badge-success',
  ARCHIVED: 'badge-ghost',
}[status] || 'badge-ghost');

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString() : '—');
</script>
