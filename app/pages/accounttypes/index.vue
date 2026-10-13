<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Account types</li>
          </ul>
        </div>
      </div>
    </div>

   
    <Accounttypes
      :accounttypes="accounttypes"
      :loading="loading"
      :onPageChange="handlePageChange"
      @search-change="handleSearch"
    />
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
definePageMeta({
  layout: "default",
});
useHead({
  title: "Account types",
});
const accounttypeStore = useAccounttypeStore()

// Use reactive state directly from the store so that
// when create()/fetchAccounttypes() run, the list updates automatically.
const loading = computed(() => accounttypeStore.loading)
const accounttypes = computed(() => accounttypeStore.accounttypes)

const fetchAccounttypes = async (page = 1) => {
  await accounttypeStore.fetchAccounttypes(page)
}

const handlePageChange = async (page) => {
  if (!accounttypes.value) return

  const current = accounttypes.value.current_page ?? 1
  const last = accounttypes.value.last_page ?? 1

  if (page < 1 || page > last || page === current) return

  await fetchAccounttypes(page)
}

const handleSearch = async (search) => {
  await accounttypeStore.setSearch(search)
}

onMounted(async () => {
  await fetchAccounttypes()
})
</script>