<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Sources of Funds</span>
        <SourceoffundsAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search sources of funds..."
            class="input input-bordered w-full max-w-xs"
          />
          <select v-model="statusFilter" class="select select-bordered max-w-xs">
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="4" class="text-center text-base-content/50">No sources of funds found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>
                <span :class="['badge badge-sm', item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost']">
                  {{ item.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <SourceoffundsEdit v-if="canEdit" :item="item" />
                  <SourceoffundsDelete v-if="canDelete && item.status === 'ACTIVE'" :item="item" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useSourceOfFundStore();
const search = ref('');
const statusFilter = ref('');

defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const filtered = computed(() =>
  store.items.filter((i) => {
    const matchesSearch = i.name?.toLowerCase().includes(search.value.toLowerCase());
    const matchesStatus = !statusFilter.value || i.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  }),
);
</script>
