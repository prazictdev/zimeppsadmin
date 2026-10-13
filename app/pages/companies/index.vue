<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Customers</li>
          </ul>
        </div>
      </div>
    </div>
    <Companies
      :companies="companies"
      :loading="loading"
      :accounttypes="accounttypes"
      :categories="allCategories"
      :provinces="allProvinces"
      :appliedFilters="filters"
      :appliedSearch="companyStore.search"
      :hasSearched="companyStore.hasSearched"
      :onPageChange="handlePageChange"
      @search-submit="handleSearchSubmit"
      @clear-results="companyStore.clearSearch()"
      @import-completed="refreshResults"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Customers' });

const companyStore = useCompanyStore();
const accounttypeStore = useAccounttypeStore();
const categoryStore = useCompanyCategoryStore();
const provinceStore = useProvinceStore();
const companies = computed(() => companyStore.companies);
const filters = computed(() => companyStore.filters);
const accounttypes = computed(() => accounttypeStore.accounttypes ?? []);
const allCategories = computed(() => categoryStore.allCategories);
const allProvinces = computed(() => provinceStore.allProvinces);

const loading = computed(() => companyStore.loading);

const fetchCompanies = async (page = 1) => {
  await companyStore.fetchCompanies(page);
};

const fetchAllAccounttypes = async () => {
  await accounttypeStore.fetchAllAccounttypes();
};
const fetchAllFiltersData = async () => {
  await Promise.all([
    categoryStore.fetchAllCategories(),
    provinceStore.fetchAllProvinces(),
  ]);
};
const handlePageChange = async (page) => {
  if (!companies.value) return;
  const current = companies.value.current_page ?? 1;
  const last = companies.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await fetchCompanies(page);
};

const handleSearchSubmit = async ({ search, filters: selectedFilters }) => {
  companyStore.setSearch(search);
  companyStore.setFilters(selectedFilters);
  await fetchCompanies(1);
};

const refreshResults = async () => {
  if (companyStore.hasSearched) await fetchCompanies(1);
};

onMounted(async () => {
  await Promise.all([
    fetchAllAccounttypes(),
    fetchAllFiltersData(),
  ]);
});
</script>
