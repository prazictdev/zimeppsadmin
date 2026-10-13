import { defineStore } from 'pinia';

export const useSupplierGroupThresholdStore = defineStore('suppliergroupthreshold', () => {
  const items = ref([]);
  const groupedItems = ref([]);
  const loading = ref(false);

  const {
    getSupplierGroupThresholds,
    getSupplierGroupThreshold,
    getThresholdsBySupplierGroup,
    createSupplierGroupThreshold,
    updateSupplierGroupThreshold,
    deleteSupplierGroupThreshold,
  } = useSupplierGroupThresholdHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getSupplierGroupThresholds();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch supplier group thresholds.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const fetchBySupplierGroup = async (suppliergroupId) => {
    loading.value = true;
    const { data, error } = await getThresholdsBySupplierGroup(suppliergroupId);
    if (!error.value) {
      groupedItems.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch thresholds.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getSupplierGroupThreshold(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch supplier group threshold.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload, suppliergroupId) => {
    try {
      const { data: response, status, error } = await createSupplierGroupThreshold(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Threshold created', message: res.message, position: 'topRight', layout: 2 });
        await fetchBySupplierGroup(suppliergroupId);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create threshold';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload, suppliergroupId) => {
    try {
      const { data: response, status, error } = await updateSupplierGroupThreshold(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Threshold updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchBySupplierGroup(suppliergroupId);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update threshold';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id, suppliergroupId) => {
    try {
      const { data: response, status, error } = await deleteSupplierGroupThreshold(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Threshold deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchBySupplierGroup(suppliergroupId);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete threshold';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, groupedItems, loading, fetchAll, fetchBySupplierGroup, findOne, create, update, remove };
});
