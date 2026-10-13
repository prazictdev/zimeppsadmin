<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-2">
        <div>
          <span class="text-lg font-bold">Procurement law library</span>
          <p class="text-sm text-base-content/60">
            Upload procurement legislation as PDF or an UNSPSC code/title catalogue as CSV or text. Indexing runs in the background.
          </p>
        </div>
        <button v-if="canAdd" class="btn btn-primary btn-sm" type="button" @click="openUpload">
          <Icon name="lucide:upload" class="h-4 w-4" />
          Upload document
        </button>
      </div>

      <div class="mt-2">
        <span :class="['badge badge-sm', store.kbReady ? 'badge-success' : 'badge-warning']">
          {{ store.kbReady ? 'Knowledge base ready' : 'Not indexed' }}
        </span>
      </div>

      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg" />
      </div>
      <table v-else class="table table-zebra mt-3 w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Title</th>
            <th>Citation</th>
            <th>UNSPSC</th>
            <th>Chunks</th>
            <th>Indexed</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!store.sources.length">
            <td colspan="8" class="text-center text-base-content/50">No documents uploaded yet.</td>
          </tr>
          <tr v-for="(item, i) in store.sources" :key="item.id">
            <td>{{ i + 1 }}</td>
            <td>{{ item.source_type }}</td>
            <td>{{ item.title }}</td>
            <td class="text-sm">{{ item.citation || '—' }}</td>
            <td class="font-mono text-sm">{{ item.unspsc_code || '—' }}</td>
            <td>{{ item.chunk_count }}</td>
            <td class="text-xs">
              <span :class="['badge badge-sm', indexStatusClass(item.index_status)]" :title="item.index_error || ''">
                {{ item.index_status || (item.indexed_at ? 'INDEXED' : 'PENDING') }}
              </span>
              <div v-if="item.indexed_at" class="mt-1">{{ formatDate(item.indexed_at) }}</div>
            </td>
            <td class="text-right">
              <button v-if="canEdit" class="btn btn-ghost btn-xs" type="button" :disabled="['PENDING', 'PROCESSING'].includes(item.index_status)" @click="reindex(item.id)">
                Re-index
              </button>
              <button v-if="canDelete && item.status === 'ACTIVE'" class="btn btn-ghost btn-xs text-error" type="button" @click="archive(item)">
                Archive
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <dialog ref="uploadDialog" class="modal">
      <div class="modal-box">
        <h3 class="text-lg font-bold">Upload procurement law document</h3>
        <form class="mt-4 space-y-3" @submit.prevent="submit">
          <label class="form-control w-full">
            <span class="label-text">Document type</span>
            <select v-model="formType" class="select select-bordered w-full" required>
              <option value="ACT">Act</option>
              <option value="REGULATIONS">Regulations</option>
              <option value="STATUTORY_INSTRUMENT">Statutory instrument</option>
              <option value="UNSPSC">UNSPSC</option>
            </select>
          </label>
          <label class="form-control w-full">
            <span class="label-text">Title</span>
            <input v-model="formTitle" type="text" class="input input-bordered w-full" required />
          </label>
          <label class="form-control w-full">
            <span class="label-text">Citation</span>
            <input v-model="formCitation" type="text" class="input input-bordered w-full" placeholder="e.g. Chapter 22:23 or SI 5 of 2018" />
          </label>
          <label class="form-control w-full">
            <span class="label-text">UNSPSC code <span class="text-base-content/50">(optional)</span></span>
            <input
              v-model="formUnspscCode"
              type="text"
              inputmode="numeric"
              maxlength="8"
              pattern="\d{2}|\d{4}|\d{6}|\d{8}"
              class="input input-bordered w-full font-mono"
              placeholder="e.g. 44120000"
            />
            <span class="label-text-alt text-base-content/60">Enter a 2, 4, 6, or 8 digit segment, family, class, or commodity code.</span>
          </label>
          <label class="form-control w-full">
            <span class="label-text">PDF or text file</span>
            <input ref="fileInput" type="file" accept=".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv" class="file-input file-input-bordered w-full" required @change="onFile" />
          </label>
          <div class="modal-action">
            <button class="btn" type="button" :disabled="submitting" @click="closeUpload">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting" class="loading loading-spinner loading-xs" />
              <span v-else>Upload &amp; index</span>
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup>
defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useProcurementLawStore();

const uploadDialog = ref(null);
const fileInput = ref(null);
const formType = ref('REGULATIONS');
const formTitle = ref('');
const formCitation = ref('');
const formUnspscCode = ref('');
const selectedFile = ref(null);
const submitting = ref(false);

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleString() : '';
}

function indexStatusClass(status) {
  return {
    INDEXED: 'badge-success',
    FAILED: 'badge-error',
    PROCESSING: 'badge-info',
    PENDING: 'badge-warning',
  }[status] || 'badge-ghost';
}

function openUpload() {
  formType.value = 'REGULATIONS';
  formTitle.value = '';
  formCitation.value = '';
  formUnspscCode.value = '';
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  uploadDialog.value?.showModal();
}

function closeUpload() {
  uploadDialog.value?.close();
}

function onFile(e) {
  selectedFile.value = e.target.files?.[0] ?? null;
}

async function submit() {
  if (!selectedFile.value) return;
  submitting.value = true;
  const payload = new FormData();
  payload.append('source_type', formType.value);
  payload.append('title', formTitle.value);
  if (formCitation.value) payload.append('citation', formCitation.value);
  if (formUnspscCode.value) payload.append('unspsc_code', formUnspscCode.value);
  payload.append('file', selectedFile.value, selectedFile.value.name);
  const created = await store.upload(payload);
  submitting.value = false;
  if (created) closeUpload();
}

async function reindex(id) {
  await store.reindex(id);
}

async function archive(item) {
  if (import.meta.client && !window.confirm(`Archive "${item.title}"?`)) return;
  await store.archive(item.id);
}

let refreshTimer;

onMounted(async () => {
  await store.fetchAll();
  refreshTimer = window.setInterval(() => {
    if (store.sources.some((source) => ['PENDING', 'PROCESSING'].includes(source.index_status))) {
      store.fetchAll(true);
    }
  }, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) window.clearInterval(refreshTimer);
});
</script>
