export const useProcurementMethodHelper = () => {
  const client = useSanctumClient();

  const getProcurementMethods = async () => {
    try {
      const data = await client('/api/v1/procurement-methods/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getProcurementMethod = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-methods/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createProcurementMethod = async (payload) => {
    try {
      const data = await client('/api/v1/procurement-methods', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateProcurementMethod = async (id, payload) => {
    try {
      const data = await client(`/api/v1/procurement-methods/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteProcurementMethod = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-methods/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getProcurementMethods, getProcurementMethod, createProcurementMethod, updateProcurementMethod, deleteProcurementMethod };
};
