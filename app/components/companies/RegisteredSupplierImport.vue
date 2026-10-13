<template>
  <div>
    <button class="btn btn-sm btn-outline" @click="open">
      <Icon name="lucide:upload" />
      Import registered suppliers
    </button>

    <dialog ref="dialog" class="modal">
      <div class="modal-box max-w-4xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-lg font-bold">Import registered suppliers</h3>
            <p class="mt-1 text-sm text-base-content/60">
              Preview the legacy MIS export before queuing supplier accounts and approved categories.
            </p>
          </div>
          <button class="btn btn-circle btn-ghost btn-sm" @click="close">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="mt-4 rounded-box border border-base-300 bg-base-200/40 p-4 text-sm">
          <p class="font-medium">Import safeguards</p>
          <ul class="mt-2 list-disc space-y-1 pl-5 text-base-content/70">
            <li>HTML rows appended by the legacy export are ignored.</li>
            <li>Category, supplier-group and organization-type mappings must exist.</li>
            <li>PRAZ CRM matching occurs in the queue; unmatched suppliers are not created.</li>
          </ul>
        </div>

        <fieldset class="fieldset mt-4">
          <legend class="fieldset-legend">Registered Supplier MIS CSV</legend>
          <input
            ref="fileInput"
            class="file-input file-input-bordered w-full"
            type="file"
            accept=".csv,text/csv,text/plain"
            @change="selectFile"
          />
        </fieldset>

        <div v-if="error" role="alert" class="alert alert-error alert-soft mt-4">
          <Icon name="lucide:circle-alert" />
          <span>{{ error }}</span>
        </div>

        <section v-if="previewData" class="mt-4 space-y-4">
          <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
            <div v-for="metric in metrics" :key="metric.label" class="rounded-box border border-base-300 p-3">
              <p class="text-xs text-base-content/60">{{ metric.label }}</p>
              <p class="mt-1 text-xl font-semibold">{{ metric.value }}</p>
            </div>
          </div>

          <div v-if="mappingIssues.length" class="alert alert-warning alert-soft items-start">
            <Icon name="lucide:triangle-alert" class="mt-0.5" />
            <div>
              <p class="font-medium">Reference data must be resolved</p>
              <ul class="mt-1 list-disc pl-5 text-sm">
                <li v-for="issue in mappingIssues" :key="issue">{{ issue }}</li>
              </ul>
            </div>
          </div>

          <details v-if="previewData.warnings?.length" class="rounded-box border border-base-300 p-3">
            <summary class="cursor-pointer font-medium">
              {{ previewData.warnings.length }} warning(s)
            </summary>
            <ul class="mt-2 max-h-40 list-disc overflow-auto pl-5 text-sm text-base-content/70">
              <li v-for="warning in previewData.warnings" :key="warning">{{ warning }}</li>
            </ul>
          </details>
        </section>

        <section v-if="batch" class="mt-4 rounded-box border border-base-300 p-4">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p class="font-medium">Import {{ batch.status.toLowerCase().replaceAll('_', ' ') }}</p>
              <p class="text-sm text-base-content/60">
                {{ batch.processed_suppliers }} of {{ batch.total_suppliers }} suppliers processed
              </p>
            </div>
            <span class="badge" :class="statusClass">{{ batch.status }}</span>
          </div>
          <progress
            class="progress progress-primary mt-3 w-full"
            :value="batch.processed_suppliers"
            :max="batch.total_suppliers || 1"
          />
          <div class="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
            <p><strong>{{ batch.imported_suppliers }}</strong> imported</p>
            <p><strong>{{ batch.failed_suppliers }}</strong> failed</p>
            <p><strong>{{ batch.skipped_rows }}</strong> skipped rows</p>
          </div>
          <button v-if="isFinished" class="btn btn-sm mt-3" @click="download">
            <Icon name="lucide:download" />
            Download results
          </button>
        </section>

        <div class="modal-action">
          <button class="btn" @click="close">Close</button>
          <button
            v-if="!previewData"
            class="btn btn-primary"
            :disabled="busy || !file"
            @click="runPreview"
          >
            {{ busy ? 'Validating…' : 'Preview import' }}
          </button>
          <button
            v-else-if="!batch"
            class="btn btn-primary"
            :disabled="busy || !previewData.can_import"
            @click="queueImport"
          >
            {{ busy ? 'Queuing…' : 'Queue import' }}
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup>
const emit = defineEmits(['completed'])
const dialog = ref(null)
const fileInput = ref(null)
const file = ref(null)
const previewData = ref(null)
const batch = ref(null)
const busy = ref(false)
const error = ref('')
let pollTimer = null

const helper = useRegisteredSupplierImportHelper()
const toast = useToast()

const metrics = computed(() => [
  { label: 'Valid rows', value: previewData.value?.valid_rows ?? 0 },
  { label: 'Suppliers', value: previewData.value?.suppliers ?? 0 },
  { label: 'Category codes', value: previewData.value?.category_codes ?? 0 },
  { label: 'Skipped rows', value: previewData.value?.skipped_rows ?? 0 },
])

const mappingIssues = computed(() => {
  if (!previewData.value) return []
  const issues = []
  if (previewData.value.unmapped_category_codes?.length) {
    issues.push(`Unmapped categories: ${previewData.value.unmapped_category_codes.join(', ')}`)
  }
  if (previewData.value.unmapped_customer_types?.length) {
    issues.push(`Unmapped organization types: ${previewData.value.unmapped_customer_types.join(', ')}`)
  }
  if (previewData.value.unmapped_supplier_groups?.length) {
    issues.push(`Unmapped supplier groups: ${previewData.value.unmapped_supplier_groups.join(', ')}`)
  }
  if (previewData.value.legacy_conflicts?.length) {
    issues.push(`${previewData.value.legacy_conflicts.length} legacy supplier identity conflict(s)`)
  }
  if (previewData.value.email_conflicts?.length) {
    issues.push(`${previewData.value.email_conflicts.length} email ownership conflict(s)`)
  }
  if (previewData.value.certificate_conflicts?.length) {
    issues.push(`${previewData.value.certificate_conflicts.length} certificate conflict(s)`)
  }
  return issues
})

const isFinished = computed(() => ['COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'].includes(batch.value?.status))
const statusClass = computed(() => ({
  'badge-success': batch.value?.status === 'COMPLETED',
  'badge-warning': batch.value?.status === 'COMPLETED_WITH_ERRORS',
  'badge-error': batch.value?.status === 'FAILED',
  'badge-info': ['PENDING', 'PROCESSING'].includes(batch.value?.status),
}))

const open = () => dialog.value?.showModal()
const close = () => dialog.value?.close()

const selectFile = (event) => {
  file.value = event.target.files?.[0] ?? null
  previewData.value = null
  batch.value = null
  error.value = ''
}

const message = (exception, fallback) =>
  exception?.data?.message ?? exception?.response?._data?.message ?? exception?.message ?? fallback

const runPreview = async () => {
  busy.value = true
  error.value = ''
  try {
    const response = await helper.preview(file.value)
    previewData.value = response.data
  } catch (exception) {
    error.value = message(exception, 'The CSV could not be validated.')
  } finally {
    busy.value = false
  }
}

const queueImport = async () => {
  busy.value = true
  error.value = ''
  try {
    const response = await helper.start(file.value)
    batch.value = response.data
    toast.success({ title: 'Import queued', message: response.message })
    poll()
  } catch (exception) {
    error.value = message(exception, 'The import could not be queued.')
  } finally {
    busy.value = false
  }
}

const poll = async () => {
  if (!batch.value?.uuid) return
  try {
    const response = await helper.show(batch.value.uuid)
    batch.value = response.data
    if (isFinished.value) {
      emit('completed')
      return
    }
  } catch (exception) {
    error.value = message(exception, 'Could not refresh import progress.')
  }
  pollTimer = window.setTimeout(poll, 3000)
}

const download = () => helper.downloadResults(batch.value.uuid)

onBeforeUnmount(() => {
  if (pollTimer) window.clearTimeout(pollTimer)
})
</script>
