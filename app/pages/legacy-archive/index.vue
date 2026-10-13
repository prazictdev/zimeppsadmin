<template>
  <div class="space-y-5">
    <div class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Procurement archive</li></ul></div>
        <h1 class="text-2xl font-bold">Legacy procurement archive</h1>
        <p class="text-sm text-base-content/60">Read-only tenders, final awards and contracts migrated from egplatest.</p>
      </div>
    </div>

    <form class="card border border-base-200 bg-base-100 shadow-sm" @submit.prevent="load">
      <div class="card-body grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <input v-model="filters.search" class="input input-bordered" placeholder="Reference or title">
        <input v-model="filters.entity" class="input input-bordered" placeholder="Procurement entity">
        <input v-model="filters.status" class="input input-bordered" placeholder="Source status">
        <input v-model="filters.date_from" type="date" class="input input-bordered">
        <input v-model="filters.date_to" type="date" class="input input-bordered">
        <button class="btn btn-primary" :disabled="loading"><Icon name="lucide:search" /> Search</button>
      </div>
    </form>

    <div role="tablist" class="tabs tabs-boxed w-fit">
      <button v-for="name in ['tenders', 'awards', 'contracts']" :key="name" role="tab" class="tab capitalize" :class="{ 'tab-active': tab === name }" @click="selectTab(name)">{{ name }}</button>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr><th>Reference</th><th>Title</th><th>Entity / Awardee</th><th>Status</th><th>Date</th><th>Final</th></tr>
          </thead>
          <tbody>
            <tr v-if="loading"><td colspan="6" class="py-12 text-center"><span class="loading loading-spinner" /></td></tr>
            <tr v-for="row in rows" v-else :key="`${tab}-${row.uuid}`">
              <td class="font-mono">{{ row.reference_number || row.contract_number || '—' }}</td>
              <td>
                <NuxtLink v-if="tab === 'tenders'" :to="`/legacy-archive/tenders/${row.uuid}`" class="link link-primary">{{ row.title || 'Untitled' }}</NuxtLink>
                <span v-else>{{ row.title || 'Untitled' }}</span>
              </td>
              <td>{{ row.procurement_entity || row.awardee_name || '—' }}</td>
              <td><span class="badge badge-outline badge-sm">{{ row.source_status }}</span></td>
              <td>{{ formatDate(row.closing_at || row.award_date || row.valid_from) }}</td>
              <td>{{ row.is_final == null ? '—' : row.is_final ? 'Yes' : 'No' }}</td>
            </tr>
            <tr v-if="!loading && !rows.length"><td colspan="6" class="py-12 text-center text-base-content/50">No archived records match these filters.</td></tr>
          </tbody>
        </table>
      </div>
      <div class="flex justify-between p-4">
        <button class="btn btn-sm" :disabled="page <= 1" @click="changePage(page - 1)">Previous</button>
        <span class="text-sm">Page {{ page }} of {{ lastPage }}</span>
        <button class="btn btn-sm" :disabled="page >= lastPage" @click="changePage(page + 1)">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', sanctum: { authOnly: true } })
useHead({ title: 'Legacy procurement archive' })
const archive = useLegacyArchiveHelper()
const tab = ref('tenders')
const filters = reactive({ search: '', entity: '', status: '', date_from: '', date_to: '' })
const rows = ref([])
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const error = ref('')
onMounted(load)

function selectTab(value) { tab.value = value; page.value = 1; load() }
function changePage(value) { page.value = value; load() }
async function load() {
  loading.value = true
  error.value = ''
  try {
    const response = await archive[tab.value]({ ...filters, page: page.value, per_page: 25 })
    rows.value = response.data?.data ?? []
    page.value = response.data?.current_page ?? 1
    lastPage.value = response.data?.last_page ?? 1
  } catch (exception) { error.value = exception?.data?.message || exception?.message || 'Could not load the archive.' }
  finally { loading.value = false }
}
const formatDate = (value) => value ? new Date(value).toLocaleDateString('en-ZW') : '—'
</script>
