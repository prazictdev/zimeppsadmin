<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Company Industries</li>
          </ul>
        </div>
      </div>
    </div>
    <Companyindustries
      :industries="industries"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Company Industries' });

const store = useCompanyIndustryStore();
const industries = computed(() => store.industries);
const loading = computed(() => store.loading);

const handlePageChange = async (page) => {
  if (!industries.value) return;
  const current = industries.value.current_page ?? 1;
  const last = industries.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await store.fetchIndustries(page);
};

const handleSearch = async (search) => {
  store.setSearch(search);
  await store.fetchIndustries(1);
};

onMounted(async () => {
  await store.fetchIndustries();
});
</script>
