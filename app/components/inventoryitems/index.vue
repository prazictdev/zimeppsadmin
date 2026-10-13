<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Inventory Items</span>
        <InventoryitemsAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-2 mb-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search inventory items..."
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>GL Code</th>
              <th>Bank Account Type</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="6" class="text-center text-base-content/50">No inventory items found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.name }}</td>
              <td class="font-mono text-sm">{{ item.glcode }}</td>
              <td>
                <span v-if="item.bankaccounttype" class="badge badge-ghost badge-sm">
                  {{ item.bankaccounttype.name }}
                </span>
                <span v-else class="text-base-content/30 text-sm">—</span>
              </td>
              <td>
                <span class="badge badge-sm" :class="item.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'">
                  {{ item.status ?? 'ACTIVE' }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <InventoryitemsEdit v-if="canEdit" :item="item" />
                  <InventoryitemsDelete v-if="canDelete" :item="item" />
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
defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useInventoryItemStore();
const batStore = useBankAccountTypeStore();
const search = ref('');

onMounted(() => {
  if (!batStore.items.length) batStore.fetchAll();
});

const filtered = computed(() => {
  const q = search.value.toLowerCase();
  return store.items.filter(
    (item) =>
      item.name?.toLowerCase().includes(q) ||
      item.glcode?.toLowerCase().includes(q) ||
      item.bankaccounttype?.name?.toLowerCase().includes(q),
  );
});
</script>
