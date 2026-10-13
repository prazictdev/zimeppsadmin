import { defineStore } from 'pinia';

export const useBidValidityPeriodFeeStore = defineStore('bidvalidityperiodfee', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getBidValidityPeriodFees,
    getBidValidityPeriodFee,
    createBidValidityPeriodFee,
    updateBidValidityPeriodFee,
    deleteBidValidityPeriodFee,
  } = useBidValidityPeriodFeeHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getBidValidityPeriodFees();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch bid validity period fees.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getBidValidityPeriodFee(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch bid validity period fee.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createBidValidityPeriodFee(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Fee created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create fee.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateBidValidityPeriodFee(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Fee updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update fee.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteBidValidityPeriodFee(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Fee deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete fee.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return { items, loading, fetchAll, findOne, create, update, remove };
});
