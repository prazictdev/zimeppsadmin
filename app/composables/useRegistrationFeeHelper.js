export const useRegistrationFeeHelper = () => {
  const client = useSanctumClient();

  const getRegistrationFees = async () => {
    try {
      const data = await client('/api/v1/registration-fees', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getRegistrationFee = async (id) => {
    try {
      const data = await client(`/api/v1/registration-fees/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getFeesBySupplierGroup = async (suppliergroupId) => {
    try {
      const data = await client(`/api/v1/registration-fees/by-supplier-group/${suppliergroupId}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createRegistrationFee = async (payload) => {
    try {
      const data = await client('/api/v1/registration-fees', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateRegistrationFee = async (id, payload) => {
    try {
      const data = await client(`/api/v1/registration-fees/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteRegistrationFee = async (id) => {
    try {
      const data = await client(`/api/v1/registration-fees/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getRegistrationFees,
    getRegistrationFee,
    getFeesBySupplierGroup,
    createRegistrationFee,
    updateRegistrationFee,
    deleteRegistrationFee,
  };
};
