<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Roles</li>
          </ul>
        </div>
      </div>
    </div>
    <Systemroles
      :systemroles="systemroles"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'System roles' });

const systemroleStore = useSystemroleStore();
const systemroles = computed(() => systemroleStore.systemroles);
const loading = computed(() => systemroleStore.loading);

const fetchRoles = async (page = 1) => {
  await systemroleStore.fetchRoles(page);
};

const handlePageChange = async (page) => {
  if (!systemroles.value) return;
  const current = systemroles.value.current_page ?? 1;
  const last = systemroles.value.last_page ?? 1;
  if (page < 1 || page > last || page === current) return;
  await fetchRoles(page);
};

const handleSearch = async (search) => {
  systemroleStore.setSearch(search);
  await fetchRoles(1);
};

onMounted(async () => {
  await fetchRoles();
});
</script>
