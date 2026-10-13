import { defineStore } from 'pinia';

export const useSupplierGroupStore = defineStore('suppliergroup', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getSupplierGroups,
    getSupplierGroup,
    createSupplierGroup,
    updateSupplierGroup,
    deleteSupplierGroup,
  } = useSupplierGroupHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getSupplierGroups();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch supplier groups.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getSupplierGroup(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch supplier group.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createSupplierGroup(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Group created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create group';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateSupplierGroup(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Group updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update group';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteSupplierGroup(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Group deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete group';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, loading, fetchAll, findOne, create, update, remove };
});
