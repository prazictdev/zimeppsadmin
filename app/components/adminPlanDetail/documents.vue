<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Required Documents</span>
        <span class="text-xs text-base-content/60">{{ store.planDocuments.length }} requirement{{ store.planDocuments.length === 1 ? '' : 's' }}</span>
      </div>

      <div v-if="store.subResourceLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <div v-else class="mt-3 overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-left">
              <th>#</th>
              <th>Document</th>
              <th>Status</th>
              <th>Uploaded</th>
              <th>Original filename</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.planDocuments.length">
              <td colspan="6" class="text-center text-base-content/50">No required documents configured for this plan year.</td>
            </tr>
            <tr v-for="(d, i) in store.planDocuments" :key="d.document_id ?? i">
              <td>{{ i + 1 }}</td>
              <td>
                <p class="font-medium">{{ d.name || '—' }}</p>
                <p v-if="d.notes" class="text-xs text-base-content/60">{{ d.notes }}</p>
              </td>
              <td>
                <span v-if="d.upload" class="badge badge-success badge-sm">Uploaded</span>
                <span v-else class="badge badge-warning badge-sm">Missing</span>
              </td>
              <td class="text-xs">{{ formatDate(d.upload?.uploaded_at) }}</td>
              <td class="text-xs">{{ d.upload?.filename || '—' }}</td>
              <td class="text-right">
                <AdminPlanDetailDocumentViewer
                  v-if="d.upload?.uuid"
                  :plan-uuid="planUuid"
                  :document-uuid="d.upload.uuid"
                  :url="d.upload.url || ''"
                  :name="d.name"
                  :filename="d.upload.filename"
                  :mime-type="d.upload.mime_type"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ planUuid: { type: String, required: true } });
const store = useAdminPlanStore();

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
};

onMounted(() => store.loadPlanDocuments(props.planUuid));
</script>
