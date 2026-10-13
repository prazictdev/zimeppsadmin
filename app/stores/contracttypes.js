import { defineStore } from 'pinia';

export const useContracttypeStore = defineStore('contracttype', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getContracttypes,
    getContracttype,
    createContracttype,
    updateContracttype,
    archiveContracttype,
  } = useContracttypeHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getContracttypes();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch contract types.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getContracttype(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch contract type.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createContracttype(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Contract type created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create contract type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateContracttype(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Contract type updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update contract type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const archive = async (id) => {
    try {
      const { data: response, status, error } = await archiveContracttype(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Contract type archived', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to archive contract type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, loading, fetchAll, findOne, create, update, archive };
});
