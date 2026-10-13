<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Supplier Sections</span>
        <SuppliersectionsAdd />
      </div>

      <input
        v-model="search"
        type="text"
        class="input input-sm"
        placeholder="Search sections..."
      />

      <table class="table w-full">
        <thead>
          <tr class="bg-base-200">
            <th>#</th>
            <th>Name</th>
            <th>Categories</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filtered" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.categories?.length ?? 0 }}</td>
            <td class="flex justify-end gap-2">
              <SuppliersectionsEdit :item="item" />
              <SuppliersectionsDelete :item="item" />
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="4" class="text-center text-sm text-base-content/60">No sections found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const store = useSupplierSectionStore();
const search = ref('');

const filtered = computed(() =>
  (store.items ?? []).filter((i) => i.name?.toLowerCase().includes(search.value.toLowerCase())),
);
</script>
