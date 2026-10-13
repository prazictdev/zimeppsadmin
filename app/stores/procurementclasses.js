import { defineStore } from 'pinia';

export const useProcurementClassStore = defineStore('procurementclass', () => {
  const items = ref([]);
  const loading = ref(false);

  // ─── Currently focused class + its thresholds + its fees ─────────────────
  const currentClass = ref(null);
  const currentClassLoading = ref(false);
  const thresholds = ref([]);
  const thresholdsLoading = ref(false);
  const fees = ref([]);
  const feesLoading = ref(false);

  // Lookups for threshold/fee modals (loaded on demand).
  const procurementgroups = ref([]);
  const procurementmethods = ref([]);
  const currencies = ref([]);
  const inventoryitems = ref([]);

  const {
    getProcurementClasses,
    getProcurementClass,
    createProcurementClass,
    updateProcurementClass,
    archiveProcurementClass,
    getThresholdsByClass,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    getFeesByClass,
    createFee,
    updateFee,
    deleteFee,
  } = useProcurementClassHelper();
  const procurementGroupHelper = useProcurementGroupHelper();
  const procurementMethodHelper = useProcurementMethodHelper();
  const currencyHelper = useCurrencyHelper();
  const inventoryItemHelper = useInventoryItemHelper();
  const toast = useToast();

  const showError = (error, fallback) => {
    const msg = error?.value?.data?.message || error?.value?.message || fallback;
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
  };

  const showSuccess = (title, message) => {
    toast.success({ title, message, position: 'topRight', layout: 2 });
  };

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getProcurementClasses();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      showError(error, 'Failed to fetch procurement classes.');
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getProcurementClass(id);
    if (!error.value) return data.value?.data ?? null;
    showError(error, 'Failed to fetch procurement class.');
    return null;
  };

  const fetchClass = async (id) => {
    currentClassLoading.value = true;
    const result = await findOne(id);
    if (result) currentClass.value = result;
    currentClassLoading.value = false;
    return result;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createProcurementClass(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        showSuccess('Procurement class created', res.message);
        await fetchAll();
      } else {
        showError(error || ref({ data: { message: res?.message } }), 'Failed to create procurement class.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateProcurementClass(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        showSuccess('Procurement class updated', res.message);
        await fetchAll();
      } else {
        showError(error || ref({ data: { message: res?.message } }), 'Failed to update procurement class.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const archive = async (id) => {
    try {
      const { data: response, status, error } = await archiveProcurementClass(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        showSuccess('Procurement class archived', res.message);
        await fetchAll();
      } else {
        showError(error || ref({ data: { message: res?.message } }), 'Failed to archive procurement class.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─── Lookups (shared by threshold + fee modals) ──────────────────────────
  const fetchThresholdLookups = async () => {
    if (procurementgroups.value.length === 0) {
      const { data, error } = await procurementGroupHelper.getProcurementGroups();
      if (!error.value) procurementgroups.value = data.value?.data ?? [];
    }
    if (procurementmethods.value.length === 0) {
      const { data, error } = await procurementMethodHelper.getProcurementMethods();
      if (!error.value) procurementmethods.value = data.value?.data ?? [];
    }
    if (currencies.value.length === 0) {
      const { data, error } = await currencyHelper.getCurrencies();
      if (!error.value) currencies.value = data.value?.data ?? [];
    }
  };

  const fetchFeeLookups = async () => {
    if (currencies.value.length === 0) {
      const { data, error } = await currencyHelper.getCurrencies();
      if (!error.value) currencies.value = data.value?.data ?? [];
    }
    if (inventoryitems.value.length === 0) {
      const { data, error } = await inventoryItemHelper.getInventoryItems();
      if (!error.value) inventoryitems.value = data.value?.data ?? [];
    }
  };

  const fetchThresholds = async (classId) => {
    thresholdsLoading.value = true;
    const { data, error } = await getThresholdsByClass(classId);
    if (!error.value) {
      thresholds.value = data.value?.data ?? [];
    } else {
      showError(error, 'Failed to fetch thresholds.');
    }
    thresholdsLoading.value = false;
  };

  const addThreshold = async (payload, classId) => {
    const { data: response, status, error } = await createThreshold(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Threshold added', res.message);
      if (classId) await fetchThresholds(classId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to add threshold.');
    return false;
  };

  const editThreshold = async (id, payload, classId) => {
    const { data: response, status, error } = await updateThreshold(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Threshold updated', res.message);
      if (classId) await fetchThresholds(classId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update threshold.');
    return false;
  };

  const removeThreshold = async (id, classId) => {
    const { data: response, status, error } = await deleteThreshold(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Threshold deleted', res.message);
      if (classId) await fetchThresholds(classId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to delete threshold.');
    return false;
  };

  // ─── Fees ────────────────────────────────────────────────────────────────
  const fetchFees = async (classId) => {
    feesLoading.value = true;
    const { data, error } = await getFeesByClass(classId);
    if (!error.value) {
      fees.value = data.value?.data ?? [];
    } else {
      showError(error, 'Failed to fetch fees.');
    }
    feesLoading.value = false;
  };

  const addFee = async (payload, classId) => {
    const { data: response, status, error } = await createFee(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Fee added', res.message);
      if (classId) await fetchFees(classId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to add fee.');
    return false;
  };

  const editFee = async (id, payload, classId) => {
    const { data: response, status, error } = await updateFee(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Fee updated', res.message);
      if (classId) await fetchFees(classId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update fee.');
    return false;
  };

  const removeFee = async (id, classId) => {
    const { data: response, status, error } = await deleteFee(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Fee deleted', res.message);
      if (classId) await fetchFees(classId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to delete fee.');
    return false;
  };

  return {
    items,
    loading,
    fetchAll,
    findOne,
    create,
    update,
    archive,
    // class detail + thresholds
    currentClass,
    currentClassLoading,
    fetchClass,
    thresholds,
    thresholdsLoading,
    procurementgroups,
    procurementmethods,
    currencies,
    inventoryitems,
    fetchThresholdLookups,
    fetchFeeLookups,
    fetchThresholds,
    addThreshold,
    editThreshold,
    removeThreshold,
    fees,
    feesLoading,
    fetchFees,
    addFee,
    editFee,
    removeFee,
  };
});
