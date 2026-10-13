<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Districts</li>
          </ul>
        </div>
      </div>
    </div>
    <Districts
      :districts="districts"
      :provinces="allProvinces"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
      @province-filter-change="handleProvinceFilter"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Districts' });

const store = useDistrictStore();
const provinceStore = useProvinceStore();

const districts = computed(() => store.districts);
const loading = computed(() => store.loading);
const allProvinces = computed(() => provinceStore.allProvinces);

const handlePageChange = async (page) => {
  if (!districts.value) return;
  const current = districts.value.current_page ?? 1;
  const last = districts.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await store.fetchDistricts(page);
};

const handleSearch = async (search) => {
  store.setSearch(search);
  await store.fetchDistricts(1);
};

const handleProvinceFilter = async (provinceId) => {
  store.setFilterProvince(provinceId);
  await store.fetchDistricts(1);
};

onMounted(async () => {
  await store.fetchDistricts();
  await provinceStore.fetchAllProvinces();
});
</script>
