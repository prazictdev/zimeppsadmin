<template>
    <div>
        <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Modules</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
    <Systemmodules
      :systemmodules="systemmodules"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
    />
    <Loader :loading="loading" />
</template>
<script setup>
definePageMeta({
    layout: 'default'
})
useHead({
    title: 'System modules'
})
const systemmoduleStore = useSystemmoduleStore()
const systemmodules = computed(() => systemmoduleStore.systemmodules)
const loading = computed(() => systemmoduleStore.loading)
const fetchSystemmodules = async (page = 1) => {
    await systemmoduleStore.fetchModules(page)
}
const handlePageChange = async (page) => {
    if (!systemmodules.value) return

    const current = systemmodules.value.current_page ?? 1
    const last = systemmodules.value.last_page ?? 1

    if (page < 1 || page > last || page === current) return

    await fetchSystemmodules(page)
}
const handleSearch = async (search) => {
    await systemmoduleStore.setSearch(search)
}
onMounted(async () => {
    await fetchSystemmodules()
})
</script>