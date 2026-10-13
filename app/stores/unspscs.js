import { defineStore } from 'pinia';

export const useUnspscStore = defineStore('unspsc', () => {
  const items = ref([]);
  const loading = ref(false);
  const pagination = reactive({
    currentPage: 1,
    lastPage: 1,
    perPage: 25,
    total: 0,
  });
  const filters = reactive({
    search: '',
    status: '',
  });

  const {
    getUnspscs,
    getUnspsc,
    createUnspsc,
    updateUnspsc,
    archiveUnspsc,
    importUnspscs,
  } = useUnspscHelper();
  const toast = useToast();

  const fetchPage = async (page = pagination.currentPage) => {
    loading.value = true;
    const { data, error } = await getUnspscs({
      page,
      perPage: pagination.perPage,
      search: filters.search,
      status: filters.status,
    });

    if (!error.value) {
      const paginated = data.value?.data ?? {};
      items.value = paginated.data ?? [];
      pagination.currentPage = paginated.current_page ?? 1;
      pagination.lastPage = paginated.last_page ?? 1;
      pagination.perPage = paginated.per_page ?? pagination.perPage;
      pagination.total = paginated.total ?? 0;
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch UNSPSC codes.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }

    loading.value = false;
  };

  const setSearch = async (value) => {
    filters.search = value ?? '';
    await fetchPage(1);
  };

  const setStatus = async (value) => {
    filters.status = value ?? '';
    await fetchPage(1);
  };

  const setPerPage = async (value) => {
    pagination.perPage = Math.max(10, Math.min(200, Number(value) || 25));
    await fetchPage(1);
  };

  const findOne = async (id) => {
    const { data, error } = await getUnspsc(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch UNSPSC code.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createUnspsc(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'UNSPSC code created', message: res.message, position: 'topRight', layout: 2 });
        await fetchPage(1);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create UNSPSC code.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateUnspsc(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'UNSPSC code updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchPage(pagination.currentPage);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update UNSPSC code.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const archive = async (id) => {
    try {
      const { data: response, status, error } = await archiveUnspsc(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'UNSPSC code archived', message: res.message, position: 'topRight', layout: 2 });
        await fetchPage(pagination.currentPage);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to archive UNSPSC code.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const importCsv = async (file, catalogue = {}) => {
    try {
      const { data: response, status, error } = await importUnspscs(file, catalogue);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Import complete', message: res.message, position: 'topRight', layout: 2 });
        await fetchPage(1);
        return res?.data ?? null;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to import UNSPSC codes.';
      toast.error({ title: 'Import failed', message: msg, position: 'topRight', layout: 2 });
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    items,
    loading,
    pagination,
    filters,
    fetchPage,
    setSearch,
    setStatus,
    setPerPage,
    findOne,
    create,
    update,
    archive,
    importCsv,
  };
});
