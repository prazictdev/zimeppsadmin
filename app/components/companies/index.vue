<template>
  <section class="mt-3 space-y-4">
    <header class="flex flex-col gap-4 rounded-xl border border-base-300 bg-base-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45">Customer administration</p>
        <h1 class="mt-1 text-xl font-bold">Customers</h1>
        <p class="mt-1 text-sm text-base-content/55">Find and manage organisations registered on the eGP platform.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <CompaniesRegisteredSupplierImport v-if="can('can.import.companies')" @completed="$emit('import-completed')" />
        <CompaniesAdd :accounttypes="accounttypes" :regulator="regulatorExistsInResults" />
      </div>
    </header>

    <form class="rounded-xl border border-base-300 bg-base-100" @submit.prevent="submitSearch">
      <header class="flex items-center justify-between border-b border-base-200 px-5 py-3">
        <div><h2 class="font-semibold">Retrieval parameters</h2><p class="text-xs text-base-content/45">Set at least one parameter before retrieving customer records.</p></div>
        <span class="badge badge-ghost badge-sm">{{ activeFiltersCount }} selected</span>
      </header>

      <div class="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
        <label class="fieldset xl:col-span-2">
          <span class="fieldset-legend">Customer name or registration number</span>
          <label class="input input-sm w-full border-base-300">
            <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
            <input v-model.trim="search" type="search" class="grow" placeholder="Enter a name or registration number" />
          </label>
        </label>

        <label class="fieldset">
          <span class="fieldset-legend">Customer type</span>
          <select v-model="selectedAccounttypeId" class="select select-sm w-full border-base-300">
            <option value="">Any customer type</option>
            <option v-for="type in accounttypes" :key="type.id" :value="type.id">{{ type.name }}</option>
          </select>
        </label>

        <label class="fieldset">
          <span class="fieldset-legend">Country</span>
          <select v-model="selectedCountry" class="select select-sm w-full border-base-300">
            <option value="">Any country</option>
            <option v-for="country in countrylist" :key="country.value" :value="country.value">{{ country.label }}</option>
          </select>
        </label>

        <label class="fieldset">
          <span class="fieldset-legend">Business category</span>
          <select v-model="selectedCategoryId" class="select select-sm w-full border-base-300" @change="handleCategoryFilterChange">
            <option value="">Any category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </label>

        <label class="fieldset">
          <span class="fieldset-legend">Business subcategory</span>
          <select v-model="selectedSubcategoryId" class="select select-sm w-full border-base-300" :disabled="!selectedCategoryId">
            <option value="">Any subcategory</option>
            <option v-for="subcategory in subcategoryOptions" :key="subcategory.id" :value="subcategory.id">{{ subcategory.name }}</option>
          </select>
        </label>

        <label class="fieldset">
          <span class="fieldset-legend">Province</span>
          <select v-model="selectedProvinceId" class="select select-sm w-full border-base-300" @change="handleProvinceFilterChange">
            <option value="">Any province</option>
            <option v-for="province in provinces" :key="province.id" :value="province.id">{{ province.name }}</option>
          </select>
        </label>

        <label class="fieldset">
          <span class="fieldset-legend">District</span>
          <select v-model="selectedDistrictId" class="select select-sm w-full border-base-300" :disabled="!selectedProvinceId">
            <option value="">Any district</option>
            <option v-for="district in districtOptions" :key="district.id" :value="district.id">{{ district.name }}</option>
          </select>
        </label>
      </div>

      <footer class="flex flex-wrap items-center justify-end gap-2 border-t border-base-200 px-5 py-3">
        <button type="button" class="btn btn-ghost btn-sm" :disabled="!hasCriteria && !hasSearched" @click="clearSearch"><Icon name="lucide:x" /> Clear</button>
        <button type="submit" class="btn btn-neutral btn-sm min-w-32" :disabled="!hasCriteria || loading">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          <Icon v-else name="lucide:database-search" />
          Retrieve customers
        </button>
      </footer>
    </form>

    <div v-if="!hasSearched" class="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-100 p-8 text-center">
      <Icon name="lucide:database-search" class="h-9 w-9 text-base-content/20" />
      <h2 class="mt-3 font-semibold">No customer records retrieved</h2>
      <p class="mt-1 max-w-md text-sm text-base-content/50">Use a name, registration number, customer type, classification, or location to retrieve a targeted result set.</p>
    </div>

    <section v-else class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <header class="flex flex-col gap-3 border-b border-base-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 class="font-bold">Customer results</h2><p class="text-xs text-base-content/45">{{ totalCustomers }} matching customer{{ totalCustomers === 1 ? '' : 's' }}</p></div>
        <div class="flex gap-4 text-xs text-base-content/50"><span>{{ shownCustomers }} shown</span><span>{{ countriesInResults }} countries</span></div>
      </header>

      <div v-if="loading" class="grid min-h-64 place-items-center"><span class="loading loading-spinner loading-lg" /></div>

      <div v-else-if="!companies?.data?.length" class="flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <Icon name="lucide:user-round-search" class="h-9 w-9 text-base-content/20" />
        <h3 class="mt-3 font-semibold">No customers matched these parameters</h3>
        <p class="mt-1 text-sm text-base-content/50">Adjust or clear one or more retrieval parameters and search again.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table table-sm min-w-[70rem]">
          <thead><tr><th>Customer</th><th>Registration</th><th>Customer type</th><th>Business classification</th><th>Location</th><th>Contact</th><th></th></tr></thead>
          <tbody>
            <tr v-for="customer in companies.data" :key="customer.id" class="hover:bg-base-200/30">
              <td><p class="max-w-64 truncate font-semibold">{{ customer.name }}</p><p class="text-xs text-base-content/40">{{ customer.users_count ?? 0 }} user{{ customer.users_count === 1 ? '' : 's' }}</p></td>
              <td class="font-mono text-xs">{{ customer.regnumber || '—' }}</td>
              <td><div class="flex max-w-56 flex-wrap gap-1"><span v-for="type in customer.accounttypes || []" :key="type.id" class="badge badge-ghost badge-sm">{{ type.name }}</span><span v-if="!customer.accounttypes?.length" class="text-xs text-base-content/40">Unclassified</span></div></td>
              <td><p class="text-sm">{{ customer.companysubcategory?.category?.name || '—' }}</p><p class="text-xs text-base-content/45">{{ customer.companysubcategory?.name || customer.companyindustry?.name || '' }}</p></td>
              <td><p class="text-sm">{{ customer.district?.name || customer.city || '—' }}</p><p class="text-xs text-base-content/45">{{ customer.province?.name || customer.country || '' }}</p></td>
              <td><p class="max-w-48 truncate text-sm">{{ customer.email || '—' }}</p><p class="text-xs text-base-content/45">{{ customer.phone || '' }}</p></td>
              <td><div class="flex justify-end gap-1"><CompaniesEdit :company="customer" :regulator="regulatorExistsInResults" :accounttypes="accounttypes" /><CompaniesDelete :company="customer" /><NuxtLink :to="`/companies/${customer.uuid}`" class="btn btn-neutral btn-sm"><Icon name="lucide:eye" /> View</NuxtLink></div></td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer v-if="companies?.last_page > 1" class="flex flex-col gap-2 border-t border-base-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-base-content/50">Showing {{ companies.from ?? 0 }}–{{ companies.to ?? 0 }} of {{ companies.total }}</p>
        <div class="join"><button class="btn btn-sm join-item" :disabled="!canGoPrev || loading" @click="changePage(companies.current_page - 1)"><Icon name="lucide:chevron-left" /> Previous</button><span class="btn btn-sm join-item btn-disabled">{{ companies.current_page }} / {{ companies.last_page }}</span><button class="btn btn-sm join-item" :disabled="!canGoNext || loading" @click="changePage(companies.current_page + 1)">Next <Icon name="lucide:chevron-right" /></button></div>
      </footer>
    </section>
  </section>
</template>

<script setup>
const props = defineProps({
  companies: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  hasSearched: { type: Boolean, default: false },
  onPageChange: { type: Function, required: false },
  accounttypes: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  provinces: { type: Array, default: () => [] },
  appliedSearch: { type: String, default: '' },
  appliedFilters: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['search-submit', 'clear-results', 'import-completed'])
const { can } = useAbility()
const search = ref(props.appliedSearch)
const selectedCountry = ref('')
const selectedCategoryId = ref('')
const selectedSubcategoryId = ref('')
const selectedProvinceId = ref('')
const selectedDistrictId = ref('')
const selectedAccounttypeId = ref('')
const subcategoryOptions = ref([])
const districtOptions = ref([])
const countrylist = ref(countryOptions)

const { getCompanySubcategories } = useCompanySubcategoryHelper()
const { getDistricts } = useDistrictHelper()

const canGoPrev = computed(() => (props.companies?.current_page ?? 1) > 1)
const canGoNext = computed(() => (props.companies?.current_page ?? 1) < (props.companies?.last_page ?? 1))
const regulatorExistsInResults = computed(() => (props.companies?.data ?? []).some(customer => customer.name?.toLowerCase().includes('regulator')))
const totalCustomers = computed(() => props.companies?.total ?? 0)
const shownCustomers = computed(() => props.companies?.data?.length ?? 0)
const countriesInResults = computed(() => new Set((props.companies?.data ?? []).map(customer => customer.country).filter(Boolean)).size)
const activeFiltersCount = computed(() => [search.value, selectedCountry.value, selectedCategoryId.value, selectedSubcategoryId.value, selectedProvinceId.value, selectedDistrictId.value, selectedAccounttypeId.value].filter(Boolean).length)
const hasCriteria = computed(() => activeFiltersCount.value > 0)

function selectedFilters() {
  return {
    country: selectedCountry.value,
    companycategory_id: selectedCategoryId.value,
    companysubcategory_id: selectedSubcategoryId.value,
    province_id: selectedProvinceId.value,
    district_id: selectedDistrictId.value,
    accounttype_id: selectedAccounttypeId.value,
  }
}

function submitSearch() {
  if (hasCriteria.value) emit('search-submit', { search: search.value, filters: selectedFilters() })
}

function changePage(page) {
  props.onPageChange?.(page)
}

async function fetchSubcategoryOptions() {
  if (!selectedCategoryId.value) { subcategoryOptions.value = []; return }
  const { ok, data } = await getCompanySubcategories('', 1, 1000, selectedCategoryId.value)
  subcategoryOptions.value = ok ? data?.data ?? [] : []
}

async function fetchDistrictOptions() {
  if (!selectedProvinceId.value) { districtOptions.value = []; return }
  const { ok, data } = await getDistricts('', 1, 1000, selectedProvinceId.value)
  districtOptions.value = ok ? data?.data ?? [] : []
}

async function handleCategoryFilterChange() {
  selectedSubcategoryId.value = ''
  await fetchSubcategoryOptions()
}

async function handleProvinceFilterChange() {
  selectedDistrictId.value = ''
  await fetchDistrictOptions()
}

function clearSearch() {
  search.value = ''
  selectedCountry.value = ''
  selectedCategoryId.value = ''
  selectedSubcategoryId.value = ''
  selectedProvinceId.value = ''
  selectedDistrictId.value = ''
  selectedAccounttypeId.value = ''
  subcategoryOptions.value = []
  districtOptions.value = []
  emit('clear-results')
}

watch(() => props.appliedSearch, value => { search.value = value ?? '' })
watch(() => props.appliedFilters, async (value) => {
  selectedCountry.value = value?.country ?? ''
  selectedCategoryId.value = value?.companycategory_id ?? ''
  selectedSubcategoryId.value = value?.companysubcategory_id ?? ''
  selectedProvinceId.value = value?.province_id ?? ''
  selectedDistrictId.value = value?.district_id ?? ''
  selectedAccounttypeId.value = value?.accounttype_id ?? ''
  await Promise.all([fetchSubcategoryOptions(), fetchDistrictOptions()])
}, { immediate: true, deep: true })
</script>
