export const useSourceOfFundHelper = () => {
  const client = useSanctumClient();

  const getSourceOfFunds = async () => {
    try {
      const data = await client('/api/v1/source-of-funds/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSourceOfFund = async (id) => {
    try {
      const data = await client(`/api/v1/source-of-funds/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSourceOfFund = async (payload) => {
    try {
      const data = await client('/api/v1/source-of-funds', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSourceOfFund = async (id, payload) => {
    try {
      const data = await client(`/api/v1/source-of-funds/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveSourceOfFund = async (id) => {
    try {
      const data = await client(`/api/v1/source-of-funds/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getSourceOfFunds,
    getSourceOfFund,
    createSourceOfFund,
    updateSourceOfFund,
    archiveSourceOfFund,
  };
};
