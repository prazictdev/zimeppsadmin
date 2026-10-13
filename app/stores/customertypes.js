import { defineStore } from 'pinia';

export const useCustomerTypeStore = defineStore('customertype', () => {
  const items = ref([]);
  const loading = ref(false);

  const { getCustomerTypes, getCustomerType, createCustomerType, updateCustomerType, deleteCustomerType } =
    useCustomerTypeHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getCustomerTypes();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch customer types.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getCustomerType(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch customer type.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createCustomerType(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Customer type created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create customer type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateCustomerType(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Customer type updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update customer type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteCustomerType(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Customer type deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete customer type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, loading, fetchAll, findOne, create, update, remove };
});
