<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Company Categories</li>
          </ul>
        </div>
      </div>
    </div>
    <Companycategories
      :categories="categories"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Company Categories' });

const store = useCompanyCategoryStore();
const categories = computed(() => store.categories);
const loading = computed(() => store.loading);

const handlePageChange = async (page) => {
  if (!categories.value) return;
  const current = categories.value.current_page ?? 1;
  const last = categories.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await store.fetchCategories(page);
};

const handleSearch = async (search) => {
  store.setSearch(search);
  await store.fetchCategories(1);
};

onMounted(async () => {
  await store.fetchCategories();
});
</script>
