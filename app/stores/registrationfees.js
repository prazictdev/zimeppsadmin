import { defineStore } from 'pinia';

export const useRegistrationFeeStore = defineStore('registrationfee', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getRegistrationFees,
    getRegistrationFee,
    getFeesBySupplierGroup,
    createRegistrationFee,
    updateRegistrationFee,
    deleteRegistrationFee,
  } = useRegistrationFeeHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getRegistrationFees();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch registration fees.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const fetchBySupplierGroup = async (suppliergroupId) => {
    loading.value = true;
    const { data, error } = await getFeesBySupplierGroup(suppliergroupId);
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch registration fees.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getRegistrationFee(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch registration fee.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload, suppliergroupId) => {
    try {
      const { data: response, status, error } = await createRegistrationFee(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Fee created', message: res.message, position: 'topRight', layout: 2 });
        await fetchBySupplierGroup(suppliergroupId);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create fee';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload, suppliergroupId) => {
    try {
      const { data: response, status, error } = await updateRegistrationFee(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Fee updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchBySupplierGroup(suppliergroupId);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update fee';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id, suppliergroupId) => {
    try {
      const { data: response, status, error } = await deleteRegistrationFee(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Fee deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchBySupplierGroup(suppliergroupId);
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete fee';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, loading, fetchAll, fetchBySupplierGroup, findOne, create, update, remove };
});
