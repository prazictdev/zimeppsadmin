import { defineStore } from 'pinia';

export const useProcurementLawStore = defineStore('procurementlaw', () => {
  const sources = ref([]);
  const kbReady = ref(false);
  const loading = ref(false);

  const { getSources, uploadSource, reindexSource, archiveSource } = useProcurementLawHelper();
  const toast = useToast();

  const fetchAll = async (silent = false) => {
    if (!silent) loading.value = true;
    const { data, error } = await getSources();
    if (!error.value) {
      sources.value = data.value?.data?.sources ?? [];
      kbReady.value = Boolean(data.value?.data?.kb_ready);
    } else {
      toast.error({ title: 'Error', message: error.value?.data?.message || 'Failed to load sources.', position: 'topRight', layout: 2 });
    }
    if (!silent) loading.value = false;
  };

  const upload = async (payload) => {
    const { status, error } = await uploadSource(payload);
    if (status?.value) {
      toast.success({ title: 'Queued', message: 'Document uploaded and queued for indexing.', position: 'topRight', layout: 2 });
      await fetchAll();
      return true;
    }
    toast.error({ title: 'Error', message: error?.value?.data?.message || 'Upload failed.', position: 'topRight', layout: 2 });
    return false;
  };

  const reindex = async (id) => {
    const { status, error } = await reindexSource(id);
    if (status?.value) {
      toast.success({ title: 'Queued', message: 'Document queued for re-indexing.', position: 'topRight', layout: 2 });
      await fetchAll();
      return true;
    }
    toast.error({ title: 'Error', message: error?.value?.data?.message || 'Re-index failed.', position: 'topRight', layout: 2 });
    return false;
  };

  const archive = async (id) => {
    const { status } = await archiveSource(id);
    if (status?.value) {
      toast.success({ title: 'Archived', message: 'Source archived.', position: 'topRight', layout: 2 });
      await fetchAll();
    }
  };

  return { sources, kbReady, loading, fetchAll, upload, reindex, archive };
});
