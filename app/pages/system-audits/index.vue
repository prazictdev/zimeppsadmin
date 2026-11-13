<template>
  <div class="space-y-5">
    <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>System audit</li></ul></div>
    <div v-if="!canAccess" class="alert alert-warning"><Icon name="lucide:lock" class="h-5 w-5" />You need system-audit access to view cross-entity records.</div>
    <section v-else class="card card-border bg-base-100 shadow-sm">
      <div class="card-body gap-5 p-5">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex items-center gap-3"><div class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon name="lucide:scan-search" class="h-5 w-5" /></div><div><h1 class="text-xl font-bold sm:text-2xl">System procurement audit</h1><p class="text-sm text-base-content/55">Trace procurement activity across every entity from APP line to award.</p></div></div>
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label class="input input-sm w-full sm:w-64"><Icon name="lucide:search" class="h-4 w-4 opacity-50" /><input v-model.trim="search" type="search" placeholder="Search records" /></label>
            <select v-model="companyUuid" class="select select-sm w-full sm:w-56"><option value="">All procurement entities</option><option v-for="company in companies" :key="company.uuid" :value="company.uuid">{{ company.name }}</option></select>
            <select v-model.number="year" class="select select-sm w-full sm:w-28"><option v-for="option in years" :key="option" :value="option">{{ option }}</option></select>
            <button class="btn btn-sm" :disabled="loading" @click="load"><Icon name="lucide:refresh-cw" :class="['h-4 w-4', loading && 'animate-spin']" />Refresh</button>
          </div>
        </div>
        <div v-if="errorMessage" class="alert alert-error"><Icon name="lucide:triangle-alert" class="h-5 w-5" />{{ errorMessage }}</div>
        <div v-if="loading && !rows.length" class="flex justify-center py-16"><span class="loading loading-spinner loading-lg" /></div>
        <div v-else-if="!rows.length" class="rounded-xl border border-dashed border-base-300 py-16 text-center text-base-content/50"><Icon name="lucide:database-zap" class="mx-auto mb-3 h-8 w-8" /><p class="font-medium">No audit records match these filters</p></div>
        <div v-else class="overflow-x-auto"><table class="table table-sm"><thead><tr><th>Entity</th><th>APP line</th><th>Plan</th><th class="text-right">Planned value</th><th>Tender lineage</th><th class="text-right">Audit</th></tr></thead><tbody><tr v-for="row in rows" :key="row.uuid" class="align-top"><td class="min-w-48"><p class="font-medium">{{ row.plan?.company?.name }}</p><p class="text-xs text-base-content/50">{{ row.plan?.company?.regnumber || '—' }}</p></td><td class="max-w-sm"><p class="font-semibold">{{ row.description }}</p><p class="mt-1 font-mono text-xs text-base-content/50">{{ row.reference_no || 'No reference' }}</p></td><td><p>{{ row.plan?.year }}</p><span class="badge badge-sm badge-ghost">{{ label(row.plan?.status) }}</span></td><td class="text-right font-mono font-semibold">{{ money(row.total_cost) }}</td><td class="min-w-72"><div v-if="row.tenders?.length" class="space-y-2"><NuxtLink v-for="tender in row.tenders" :key="tender.uuid" :to="`/system-audits/tenders/${tender.uuid}`" class="flex items-center justify-between gap-3 rounded-lg border border-base-200 px-3 py-2 hover:border-primary/40 hover:bg-primary/5"><span class="min-w-0"><span class="block truncate text-sm font-medium">{{ tender.title }}</span><span class="block text-xs text-base-content/50">{{ tender.tendernumber || 'Number pending' }}</span></span><span class="badge badge-sm badge-outline shrink-0">{{ label(tender.status) }}</span></NuxtLink></div><span v-else class="text-sm text-base-content/45">No tender created</span></td><td class="text-right"><NuxtLink :to="`/system-audits/app-items/${row.uuid}`" class="btn btn-ghost btn-sm"><Icon name="lucide:file-clock" class="h-4 w-4" />History</NuxtLink></td></tr></tbody></table></div>
        <div v-if="pagination.total" class="flex flex-wrap items-center justify-between gap-3 border-t border-base-200 pt-4"><p class="text-xs text-base-content/55">{{ pagination.total }} APP lines</p><div class="join"><button class="btn join-item btn-sm" :disabled="page <= 1 || loading" @click="page--">Previous</button><button class="btn join-item btn-sm btn-disabled">{{ page }} / {{ pagination.last_page }}</button><button class="btn join-item btn-sm" :disabled="page >= pagination.last_page || loading" @click="page++">Next</button></div></div>
      </div>
    </section>
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default' }); useHead({ title: 'System procurement audit' })
const { can } = useCheckPermission(); const canAccess = computed(() => can('can.access.systemaudits')); const api = useSystemAuditHelper()
const now = new Date().getFullYear(); const years = Array.from({ length: 7 }, (_, index) => now + 1 - index)
const year = ref(now); const search = ref(''); const companyUuid = ref(''); const companies = ref([]); const page = ref(1); const rows = ref([]); const loading = ref(false); const errorMessage = ref(''); const pagination = reactive({ total: 0, last_page: 1 }); let timer
const label = value => String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
const money = value => new Intl.NumberFormat('en-ZW', { style: 'currency', currency: 'USD' }).format(Number(value || 0))
async function load() { loading.value = true; errorMessage.value = ''; const { data, error } = await api.listAppItems({ year: year.value, company_uuid: companyUuid.value, search: search.value, page: page.value, per_page: 20 }); loading.value = false; if (error || data?.status === false) { errorMessage.value = error?.data?.message || data?.message || 'System audit records could not be loaded.'; return } const result = data?.data ?? {}; rows.value = result.data ?? []; pagination.total = result.total ?? 0; pagination.last_page = result.last_page ?? 1 }
watch([year, companyUuid], () => { page.value = 1; load() }); watch(page, load); watch(search, () => { page.value = 1; clearTimeout(timer); timer = setTimeout(load, 350) })
onMounted(async () => { if (!canAccess.value) return; const result = await api.companies(); companies.value = result.data?.data ?? []; await load() }); onBeforeUnmount(() => clearTimeout(timer))
</script>
