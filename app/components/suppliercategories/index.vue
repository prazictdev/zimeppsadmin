<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Supplier Categories</span>
        <SuppliercategoriesAdd v-if="canAdd" />
      </div>

      <input
        v-model="search"
        type="text"
        class="input input-sm"
        placeholder="Search categories..."
      />

      <table class="table w-full">
        <thead>
          <tr class="bg-base-200">
            <th>#</th>
            <th>Code</th>
            <th>Name</th>
            <th>Section</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filtered" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td><span class="badge badge-outline">{{ item.code }}</span></td>
            <td>{{ item.name }}</td>
            <td>{{ item.section?.name ?? '—' }}</td>
            <td class="flex justify-end gap-2">
              <SuppliercategoriesEdit :item="item" v-if="canEdit" />
              <SuppliercategoriesDelete :item="item" v-if="canDelete" />
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="5" class="text-center text-sm text-base-content/60">No categories found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const store = useSupplierCategoryStore();
const search = ref('');
const props = defineProps({
  canAdd: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  canAccess: {
    type: Boolean,
    default: false,
  },
});
console.log(props);
const filtered = computed(() =>
  (store.items ?? []).filter(
    (i) =>
      i.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      i.code?.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
</script>
