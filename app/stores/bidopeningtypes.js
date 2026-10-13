import { defineStore } from 'pinia';

export const useBidopeningtypeStore = defineStore('bidopeningtype', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getBidopeningtypes,
    getBidopeningtype,
    createBidopeningtype,
    updateBidopeningtype,
    archiveBidopeningtype,
  } = useBidopeningtypeHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getBidopeningtypes();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch bid opening types.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getBidopeningtype(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch bid opening type.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createBidopeningtype(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Bid opening type created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create bid opening type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateBidopeningtype(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Bid opening type updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update bid opening type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const archive = async (id) => {
    try {
      const { data: response, status, error } = await archiveBidopeningtype(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Bid opening type archived', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to archive bid opening type.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, loading, fetchAll, findOne, create, update, archive };
});
