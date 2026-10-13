<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">NSPL Editions</span>
        <NsplEditionAdd v-if="canAdd" />
      </div>

      <div class="mt-3 flex flex-wrap items-center gap-3">
        <input
          v-model="searchInput"
          type="text"
          placeholder="Search by period (e.g. January 2026)..."
          class="input input-bordered w-full max-w-xs"
        />
        <select v-model="statusInput" class="select select-bordered max-w-xs" @change="onStatusChange">
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <span class="ml-auto text-sm text-base-content/60">
          {{ pagination.total }} {{ pagination.total === 1 ? 'edition' : 'editions' }}
        </span>
      </div>

      <div v-if="store.editionsLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Period</th>
              <th>Year</th>
              <th>Q</th>
              <th>Divisions</th>
              <th>Sections</th>
              <th>Products</th>
              <th>Status</th>
              <th>Published</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.editions.length">
              <td colspan="10" class="text-center text-base-content/50">No NSPL editions yet.</td>
            </tr>
            <tr v-for="(item, i) in store.editions" :key="item.id">
              <td>{{ rowOffset + i + 1 }}</td>
              <td>
                <NuxtLink :to="`/nspl/${item.id}`" class="link link-primary">{{ item.period }}</NuxtLink>
              </td>
              <td>{{ item.year }}</td>
              <td>Q{{ item.quarter }}</td>
              <td>{{ item.divisions_count ?? 0 }}</td>
              <td>{{ item.sections_count ?? 0 }}</td>
              <td>{{ item.products_count ?? 0 }}</td>
              <td>
                <span :class="['badge badge-sm', statusBadge(item.status)]">{{ item.status }}</span>
              </td>
              <td class="text-sm text-base-content/70">
                {{ item.published_at ? formatDate(item.published_at) : '—' }}
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <NuxtLink :to="`/nspl/${item.id}`" class="btn btn-ghost btn-sm">
                    <Icon name="lucide:eye" />
                    <span class="hidden md:block">Open</span>
                  </NuxtLink>
                  <NsplEditionPublish
                    v-if="canEdit && item.status === 'DRAFT'"
                    :item="item"
                  />
                  <NsplEditionClone v-if="canAdd" :item="item" />
                  <NsplEditionEdit v-if="canEdit && item.status !== 'ARCHIVED'" :item="item" />
                  <NsplEditionArchive
                    v-if="canDelete && item.status !== 'ARCHIVED'"
                    :item="item"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination.lastPage > 1" class="mt-3 flex flex-wrap items-center justify-end gap-2">
          <button class="btn btn-sm" :disabled="pagination.currentPage === 1" @click="store.fetchEditionsPage(1)">
            <Icon name="lucide:chevrons-left" class="h-4 w-4" />
          </button>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage === 1"
            @click="store.fetchEditionsPage(pagination.currentPage - 1)"
          >Prev</button>
          <span class="text-sm">Page {{ pagination.currentPage }} of {{ pagination.lastPage }}</span>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="store.fetchEditionsPage(pagination.currentPage + 1)"
          >Next</button>
          <button
            class="btn btn-sm"
            :disabled="pagination.currentPage >= pagination.lastPage"
            @click="store.fetchEditionsPage(pagination.lastPage)"
          >
            <Icon name="lucide:chevrons-right" class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useNsplStore();
const { editionsPagination: pagination } = storeToRefs(store);

defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const searchInput = ref(store.editionsFilters.search);
const statusInput = ref(store.editionsFilters.status);

const rowOffset = computed(() => (pagination.value.currentPage - 1) * pagination.value.perPage);

let searchTimer = null;
watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.setEditionsSearch(value), 300);
});

const onStatusChange = () => store.setEditionsStatus(statusInput.value);

const statusBadge = (status) => ({
  DRAFT: 'badge-warning',
  PUBLISHED: 'badge-success',
  ARCHIVED: 'badge-ghost',
}[status] || 'badge-ghost');

const formatDate = (iso) => new Date(iso).toLocaleDateString();
</script>
