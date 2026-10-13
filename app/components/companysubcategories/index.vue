<template>
  <div>
    <div class="card border border-base-200 mt-3">
      <div class="card-body">
        <div class="border-b border-base-200 pb-2">
          <div class="flex justify-between items-center">
            <div class="text-lg font-bold">Company Subcategories</div>
            <div class="flex items-center gap-2">
              <CompanysubcategoriesAdd :categories="categories" />
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            class="input input-sm flex-1"
            placeholder="Search subcategory"
            v-model="search"
            @input="handleSearch"
          />
          <select
            class="select select-sm"
            v-model="selectedCategoryId"
            @change="handleCategoryFilter"
          >
            <option value="">All categories</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200 rounded-md">
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in subcategories?.data || []"
              :key="item.id ?? index"
            >
              <td>{{ ((subcategories.current_page - 1) * subcategories.per_page) + index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.companycategory?.name ?? '-' }}</td>
              <td class="flex justify-end gap-2">
                <CompanysubcategoriesEdit :subcategory="item" :categories="categories" />
                <CompanysubcategoriesDelete :subcategory="item" />
              </td>
            </tr>
            <tr v-if="!subcategories || !(subcategories.data?.length)">
              <td colspan="4" class="text-center text-sm text-base-content/60">
                No subcategories found.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="subcategories"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4"
        >
          <div class="text-sm text-base-content/60">
            <span v-if="subcategories.total">
              Showing {{ subcategories.from ?? 0 }}-{{ subcategories.to ?? 0 }} of
              {{ subcategories.total }}
            </span>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoPrev || loading }"
              :disabled="!canGoPrev || loading"
              @click="changePage(subcategories.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-base-content/80">
              Page {{ subcategories.current_page ?? 1 }} of
              {{ subcategories.last_page ?? 1 }}
            </span>
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoNext || loading }"
              :disabled="!canGoNext || loading"
              @click="changePage(subcategories.current_page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  subcategories: { type: Object, required: true },
  categories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  onPageChange: { type: Function, required: false },
});
const emit = defineEmits(['search-change', 'category-filter-change']);
const search = ref('');
const selectedCategoryId = ref('');

const canGoPrev = computed(() => (props.subcategories?.current_page ?? 1) > 1);
const canGoNext = computed(
  () =>
    (props.subcategories?.current_page ?? 1) < (props.subcategories?.last_page ?? 1),
);

const changePage = (page) => {
  if (props.onPageChange) props.onPageChange(page);
};

const handleSearch = () => {
  setTimeout(() => {
    emit('search-change', search.value);
  }, 500);
};

const handleCategoryFilter = () => {
  emit('category-filter-change', selectedCategoryId.value);
};
</script>
