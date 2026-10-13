import { defineStore } from 'pinia';

export const useProcurementEntityStore = defineStore('procurementEntities', () => {
  const items = ref([]);
  const meta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const loading = ref(false);
  const search = ref('');
  const assignedFilter = ref(''); // '' | 'yes' | 'no'

  const handlers = ref([]);
  const handlersLoading = ref(false);

  const { list, availableHandlers, assign, unassign } = useProcurementEntityHelper();
  const toast = useToast();

  const fetchAll = async (page = 1) => {
    loading.value = true;
    const { ok, data } = await list({
      page,
      per_page: meta.value.per_page,
      search: search.value || undefined,
      assigned: assignedFilter.value || undefined,
    });
    if (ok) {
      const payload = data?.data ?? {};
      items.value = payload.data ?? [];
      meta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? meta.value.per_page,
      };
    }
    loading.value = false;
  };

  const fetchHandlers = async (term = '') => {
    handlersLoading.value = true;
    const { ok, data } = await availableHandlers(term);
    if (ok) handlers.value = data?.data ?? [];
    handlersLoading.value = false;
  };

  const assignHandler = async (companyId, userId) => {
    const { ok, data, error } = await assign(companyId, userId);
    if (ok && data?.status === true) {
      toast.success({ title: 'Assigned', message: data.message, position: 'topRight', layout: 2 });
      await fetchAll(meta.value.current_page);
      return true;
    }
    toast.error({
      title: 'Failed',
      message: error?.data?.message || data?.message || 'Failed to assign handler.',
      position: 'topRight',
      layout: 2,
    });
    return false;
  };

  const unassignHandler = async (companyId) => {
    const { ok, data, error } = await unassign(companyId);
    if (ok && data?.status === true) {
      toast.success({ title: 'Unassigned', message: data.message, position: 'topRight', layout: 2 });
      await fetchAll(meta.value.current_page);
      return true;
    }
    toast.error({
      title: 'Failed',
      message: error?.data?.message || data?.message || 'Failed to unassign handler.',
      position: 'topRight',
      layout: 2,
    });
    return false;
  };

  return {
    items, meta, loading, search, assignedFilter,
    handlers, handlersLoading,
    fetchAll, fetchHandlers, assignHandler, unassignHandler,
  };
});
