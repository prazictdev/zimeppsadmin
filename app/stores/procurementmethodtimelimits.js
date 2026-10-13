import { defineStore } from 'pinia';

export const useProcurementMethodTimelimitStore = defineStore('procurementmethodtimelimit', () => {
  const items = ref([]);
  const loading = ref(false);
  const procurementmethods = ref([]);
  const procurementgroups = ref([]);

  const {
    getAll,
    getOne,
    createOne,
    updateOne,
    deleteOne,
    getProcurementMethods,
    getProcurementGroups,
  } = useProcurementMethodTimelimitHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getAll();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch time limits.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const fetchLookups = async () => {
    if (procurementmethods.value.length === 0) {
      const { data, error } = await getProcurementMethods();
      if (!error.value) procurementmethods.value = data.value?.data ?? [];
    }
    if (procurementgroups.value.length === 0) {
      const { data, error } = await getProcurementGroups();
      if (!error.value) procurementgroups.value = data.value?.data ?? [];
    }
  };

  const findOne = async (id) => {
    const { data, error } = await getOne(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch time limit.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createOne(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Time limit created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create time limit.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    } catch (err) { console.error(err); }
    return false;
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateOne(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Time limit updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update time limit.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    } catch (err) { console.error(err); }
    return false;
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteOne(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Time limit deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to delete time limit.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    } catch (err) { console.error(err); }
    return false;
  };

  return { items, loading, procurementmethods, procurementgroups, fetchAll, fetchLookups, findOne, create, update, remove };
});
