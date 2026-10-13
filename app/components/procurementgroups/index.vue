<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Procurement Groups</span>
        <ProcurementgroupsAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <input
          v-model="search"
          type="text"
          placeholder="Search procurement groups..."
          class="input input-bordered w-full max-w-xs"
        />
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="4" class="text-center text-base-content/50">No procurement groups found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <ProcurementgroupsView :item="item" :can-edit="canEdit" />
                  <ProcurementgroupsEdit :item="item" v-if="canEdit" />
                  <ProcurementgroupsDelete :item="item" v-if="canDelete" />
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
const store = useProcurementGroupStore();
const search = ref('');

const props = defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const filtered = computed(() =>
  store.items.filter(
    (i) =>
      i.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      i.code?.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
</script>
