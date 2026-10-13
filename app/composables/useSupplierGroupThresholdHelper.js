export const useSupplierGroupThresholdHelper = () => {
  const client = useSanctumClient();

  const getSupplierGroupThresholds = async () => {
    try {
      const data = await client('/api/v1/supplier-group-thresholds', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSupplierGroupThreshold = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-group-thresholds/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getThresholdsBySupplierGroup = async (suppliergroupId) => {
    try {
      const data = await client(`/api/v1/supplier-group-thresholds/by-supplier-group/${suppliergroupId}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSupplierGroupThreshold = async (payload) => {
    try {
      const data = await client('/api/v1/supplier-group-thresholds', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSupplierGroupThreshold = async (id, payload) => {
    try {
      const data = await client(`/api/v1/supplier-group-thresholds/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSupplierGroupThreshold = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-group-thresholds/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getSupplierGroupThresholds,
    getSupplierGroupThreshold,
    getThresholdsBySupplierGroup,
    createSupplierGroupThreshold,
    updateSupplierGroupThreshold,
    deleteSupplierGroupThreshold,
  };
};
