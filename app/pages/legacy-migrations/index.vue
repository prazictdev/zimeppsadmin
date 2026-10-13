<template>
  <div class="space-y-5">
    <div class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Legacy migration</li></ul>
        </div>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold">egplatest migration</h1>
            <p class="text-sm text-base-content/60">Preview, map and migrate the legacy EGP into the audited archive.</p>
          </div>
          <button class="btn btn-outline btn-sm" :disabled="busy" @click="loadAll">
            <Icon name="lucide:refresh-cw" /> Refresh
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-error"><Icon name="lucide:circle-alert" /><span>{{ error }}</span></div>
    <div v-if="notice" class="alert alert-success"><Icon name="lucide:circle-check" /><span>{{ notice }}</span></div>

    <div class="grid gap-4 xl:grid-cols-3">
      <section class="card border border-base-200 bg-base-100 shadow-sm xl:col-span-2">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h2 class="card-title text-base">Source preview</h2>
            <span class="badge" :class="previewData?.can_import ? 'badge-success' : 'badge-warning'">
              {{ previewData?.can_import ? 'Ready' : 'Crosswalks required' }}
            </span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div v-for="(value, key) in previewData?.source_totals ?? {}" :key="key" class="rounded-lg bg-base-200/60 p-3">
              <p class="text-xs uppercase text-base-content/50">{{ label(key) }}</p>
              <p class="text-xl font-bold tabular-nums">{{ Number(value).toLocaleString() }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="btn btn-sm" :disabled="busy" @click="syncCrosswalks">Synchronize crosswalks</button>
            <button class="btn btn-primary btn-sm" :disabled="busy || !crosswalksDirty" @click="saveMappings">Save mappings</button>
          </div>
        </div>
      </section>

      <section class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body">
          <h2 class="card-title text-base">Start import</h2>
          <label class="form-control">
            <span class="label-text">Mode</span>
            <select v-model="startOptions.mode" class="select select-bordered">
              <option value="FULL">Full rehearsal/import</option>
              <option value="DELTA">Final delta</option>
            </select>
          </label>
          <label class="label cursor-pointer justify-start gap-3">
            <input v-model="startOptions.verify_crm" type="checkbox" class="checkbox checkbox-primary">
            <span class="label-text">Verify suppliers against PRAZ CRM</span>
          </label>
          <div class="alert alert-info py-2 text-xs">
            <Icon name="lucide:file-check" />
            <span>Only supplier registration documents will be copied. Procurement and bid-response files are excluded.</span>
          </div>
          <button class="btn btn-success" :disabled="busy || !previewData?.can_import" @click="startImport">
            <Icon name="lucide:play" /> Queue migration
          </button>
        </div>
      </section>
    </div>

    <section class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="card-title text-base">Category crosswalk</h2>
          <button class="btn btn-ghost btn-xs" @click="confirmMappedCategories">Confirm all mapped</button>
        </div>
        <div class="max-h-96 overflow-auto">
          <table class="table table-sm table-pin-rows">
            <thead><tr><th>Legacy code</th><th>Name</th><th>Section</th><th>Confirmed</th></tr></thead>
            <tbody>
              <tr v-for="row in mappingData.categories" :key="row.id">
                <td class="font-mono">{{ row.legacy_code }}</td>
                <td>{{ row.legacy_name }}</td>
                <td>
                  <select v-model.number="row.suppliersection_id" class="select select-bordered select-xs" @change="crosswalksDirty = true">
                    <option :value="null">Select</option>
                    <option v-for="section in mappingData.sections" :key="section.id" :value="section.id">{{ section.name }}</option>
                  </select>
                </td>
                <td><input v-model="row.confirmed" type="checkbox" class="checkbox checkbox-sm" @change="crosswalksDirty = true"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="card-title text-base">Supplier document crosswalk</h2>
          <button class="btn btn-ghost btn-xs" @click="confirmMappedDocuments">Confirm all mapped</button>
        </div>
        <p class="text-xs text-base-content/60">
          Map the 16 legacy registration-document names to the current supplier document master.
          Director and shareholder identity files map automatically to National ID.
        </p>
        <div class="max-h-96 overflow-auto">
          <table class="table table-sm table-pin-rows">
            <thead><tr><th>Legacy document</th><th>Rows</th><th>Current document</th><th>Confirmed</th></tr></thead>
            <tbody>
              <tr v-for="row in mappingData.documents" :key="row.id">
                <td>{{ row.legacy_name }}</td>
                <td class="tabular-nums">{{ Number(row.source_payload?.source_count ?? 0).toLocaleString() }}</td>
                <td>
                  <select v-model.number="row.document_id" class="select select-bordered select-xs" @change="crosswalksDirty = true">
                    <option :value="null">Select</option>
                    <option v-for="document in mappingData.system_documents" :key="document.id" :value="document.id">{{ document.name }}</option>
                  </select>
                </td>
                <td><input v-model="row.confirmed" type="checkbox" class="checkbox checkbox-sm" @change="crosswalksDirty = true"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title text-base">Buyer-role crosswalk</h2>
        <div class="max-h-80 overflow-auto">
          <table class="table table-sm table-pin-rows">
            <thead><tr><th>Legacy role/designation</th><th>Current role</th><th>Confirmed</th></tr></thead>
            <tbody>
              <tr v-for="row in mappingData.roles" :key="row.id">
                <td>{{ row.legacy_label }}</td>
                <td>
                  <select v-model.number="row.role_id" class="select select-bordered select-xs" @change="crosswalksDirty = true">
                    <option :value="null">Select</option>
                    <option v-for="role in mappingData.system_roles" :key="role.id" :value="role.id">{{ role.name }}</option>
                  </select>
                </td>
                <td><input v-model="row.confirmed" type="checkbox" class="checkbox checkbox-sm" @change="crosswalksDirty = true"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="card border border-base-200 bg-base-100 shadow-sm">
      <div class="card-body">
        <h2 class="card-title text-base">Migration batches</h2>
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead><tr><th>Started</th><th>Mode</th><th>Status</th><th>Stage</th><th>Results</th><th></th></tr></thead>
            <tbody>
              <tr v-for="batch in batches" :key="batch.uuid">
                <td>{{ formatDate(batch.created_at) }}</td>
                <td>{{ batch.mode }}</td>
                <td><span class="badge badge-sm" :class="statusClass(batch.status)">{{ batch.status }}</span></td>
                <td>{{ batch.current_stage || '—' }}</td>
                <td>{{ resultSummary(batch.result_totals) }}</td>
                <td class="space-x-1 text-right">
                  <button class="btn btn-ghost btn-xs" @click="helper.downloadReport(batch.uuid)">Report</button>
                  <button
                    v-if="isComplete(batch) && !batch.notifications_released_at"
                    class="btn btn-warning btn-xs"
                    @click="release(batch)"
                  >Release activations</button>
                </td>
              </tr>
              <tr v-if="!batches.length"><td colspan="6" class="py-8 text-center text-base-content/50">No migration batches yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', sanctum: { authOnly: true } })
useHead({ title: 'Legacy migration' })

const helper = useLegacyMigrationHelper()
const previewData = ref(null)
const mappingData = reactive({ categories: [], roles: [], documents: [], sections: [], system_roles: [], system_documents: [] })
const batches = ref([])
const startOptions = reactive({ mode: 'FULL', verify_crm: true })
const crosswalksDirty = ref(false)
const busy = ref(false)
const error = ref('')
const notice = ref('')

onMounted(loadAll)

async function loadAll() {
  busy.value = true
  error.value = ''
  try {
    const [previewResponse, crosswalkResponse, batchesResponse] = await Promise.all([
      helper.preview(),
      helper.crosswalks(),
      helper.list(),
    ])
    previewData.value = previewResponse.data
    Object.assign(mappingData, crosswalkResponse.data)
    batches.value = batchesResponse.data?.data ?? []
    crosswalksDirty.value = false
  } catch (exception) {
    error.value = exception?.data?.message || exception?.message || 'Could not load legacy migration data.'
  } finally {
    busy.value = false
  }
}

async function syncCrosswalks() {
  await action(async () => {
    await helper.synchronizeCrosswalks()
    notice.value = 'Crosswalks synchronized from egplatest.'
    await loadAll()
  })
}

async function saveMappings() {
  await action(async () => {
    await helper.saveCrosswalks({
      categories: mappingData.categories.map(({ id, suppliersection_id, confirmed }) => ({ id, suppliersection_id, confirmed })),
      roles: mappingData.roles.map(({ id, role_id, confirmed }) => ({ id, role_id, confirmed })),
      documents: mappingData.documents.map(({ id, document_id, confirmed }) => ({ id, document_id, confirmed })),
    })
    notice.value = 'Crosswalks saved.'
    await loadAll()
  })
}

function confirmMappedCategories() {
  mappingData.categories.forEach((row) => { if (row.suppliersection_id) row.confirmed = true })
  crosswalksDirty.value = true
}

function confirmMappedDocuments() {
  mappingData.documents.forEach((row) => { if (row.document_id) row.confirmed = true })
  crosswalksDirty.value = true
}

async function startImport() {
  await action(async () => {
    await helper.start({ ...startOptions })
    notice.value = 'Legacy migration queued.'
    await loadAll()
  })
}

async function release(batch) {
  await action(async () => {
    await helper.releaseNotifications(batch.uuid)
    notice.value = 'Activation notifications queued.'
    await loadAll()
  })
}

async function action(callback) {
  busy.value = true
  error.value = ''
  notice.value = ''
  try { await callback() } catch (exception) {
    error.value = exception?.data?.message || exception?.message || 'The operation failed.'
  } finally { busy.value = false }
}

const label = (value) => String(value).replaceAll('_', ' ')
const formatDate = (value) => value ? new Date(value).toLocaleString('en-ZW') : '—'
const isComplete = (batch) => ['COMPLETED', 'COMPLETED_WITH_ERRORS'].includes(batch.status)
const resultSummary = (totals) => totals ? Object.entries(totals).map(([key, value]) => `${key}: ${value}`).join(' · ') : '—'
const statusClass = (status) => status === 'COMPLETED' ? 'badge-success' : status === 'FAILED' ? 'badge-error' : status === 'COMPLETED_WITH_ERRORS' ? 'badge-warning' : 'badge-info'
</script>
