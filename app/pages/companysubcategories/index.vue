<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Company Subcategories</li>
          </ul>
        </div>
      </div>
    </div>
    <Companysubcategories
      :subcategories="subcategories"
      :categories="allCategories"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
      @category-filter-change="handleCategoryFilter"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Company Subcategories' });

const store = useCompanySubcategoryStore();
const categoryStore = useCompanyCategoryStore();

const subcategories = computed(() => store.subcategories);
const loading = computed(() => store.loading);
const allCategories = computed(() => categoryStore.allCategories);

const handlePageChange = async (page) => {
  if (!subcategories.value) return;
  const current = subcategories.value.current_page ?? 1;
  const last = subcategories.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await store.fetchSubcategories(page);
};

const handleSearch = async (search) => {
  store.setSearch(search);
  await store.fetchSubcategories(1);
};

const handleCategoryFilter = async (categoryId) => {
  store.setFilterCategory(categoryId);
  await store.fetchSubcategories(1);
};

onMounted(async () => {
  await store.fetchSubcategories();
  await categoryStore.fetchAllCategories();
});
</script>
