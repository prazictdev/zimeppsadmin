import { defineStore } from 'pinia';

export const useProcurementGroupStore = defineStore('procurementgroup', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getProcurementGroups,
    getProcurementGroup,
    createProcurementGroup,
    updateProcurementGroup,
    deleteProcurementGroup,
    syncEvaluationCriteria: syncEvaluationCriteriaApi,
    syncBidopeningTypes: syncBidopeningTypesApi,
    syncProcurementMethods: syncProcurementMethodsApi,
  } = useProcurementGroupHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getProcurementGroups();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch procurement groups.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getProcurementGroup(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch procurement group.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createProcurementGroup(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Procurement group created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create procurement group.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateProcurementGroup(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Procurement group updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update procurement group.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteProcurementGroup(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Procurement group deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete procurement group.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const syncEvaluationCriteria = async (id, criterionIds) => {
    try {
      const { data: response, status, error } = await syncEvaluationCriteriaApi(id, criterionIds);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Assignment saved', message: res.message, position: 'topRight', layout: 2 });
        return res.data ?? null;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to save assignment.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const syncBidopeningTypes = async (id, bidopeningtypeIds) => {
    try {
      const { data: response, status, error } = await syncBidopeningTypesApi(id, bidopeningtypeIds);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Assignment saved', message: res.message, position: 'topRight', layout: 2 });
        return res.data ?? null;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to save assignment.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const syncProcurementMethods = async (id, methodIds, defaultMethodId) => {
    try {
      const { data: response, status, error } = await syncProcurementMethodsApi(id, methodIds, defaultMethodId);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Assignment saved', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return res.data ?? null;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to save procurement methods.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return {
    items,
    loading,
    fetchAll,
    findOne,
    create,
    update,
    remove,
    syncEvaluationCriteria,
    syncBidopeningTypes,
    syncProcurementMethods,
  };
});
