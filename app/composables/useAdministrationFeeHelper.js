export const useAdministrationFeeHelper = () => {
  const client = useSanctumClient();

  const getAdministrationFees = async () => {
    try {
      const data = await client('/api/v1/administration-fees', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getAdministrationFee = async (id) => {
    try {
      const data = await client(`/api/v1/administration-fees/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createAdministrationFee = async (payload) => {
    try {
      const data = await client('/api/v1/administration-fees', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateAdministrationFee = async (id, payload) => {
    try {
      const data = await client(`/api/v1/administration-fees/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteAdministrationFee = async (id) => {
    try {
      const data = await client(`/api/v1/administration-fees/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getAdministrationFees,
    getAdministrationFee,
    createAdministrationFee,
    updateAdministrationFee,
    deleteAdministrationFee,
  };
};
