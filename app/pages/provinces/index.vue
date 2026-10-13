<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Provinces</li>
          </ul>
        </div>
      </div>
    </div>
    <Provinces
      :provinces="provinces"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Provinces' });

const store = useProvinceStore();
const provinces = computed(() => store.provinces);
const loading = computed(() => store.loading);

const handlePageChange = async (page) => {
  if (!provinces.value) return;
  const current = provinces.value.current_page ?? 1;
  const last = provinces.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await store.fetchProvinces(page);
};

const handleSearch = async (search) => {
  store.setSearch(search);
  await store.fetchProvinces(1);
};

onMounted(async () => {
  await store.fetchProvinces();
});
</script>
