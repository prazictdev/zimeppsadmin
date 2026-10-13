export const useContracttypeHelper = () => {
  const client = useSanctumClient();

  const getContracttypes = async () => {
    try {
      const data = await client('/api/v1/contract-types/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getContracttype = async (id) => {
    try {
      const data = await client(`/api/v1/contract-types/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createContracttype = async (payload) => {
    try {
      const data = await client('/api/v1/contract-types', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateContracttype = async (id, payload) => {
    try {
      const data = await client(`/api/v1/contract-types/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveContracttype = async (id) => {
    try {
      const data = await client(`/api/v1/contract-types/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getContracttypes,
    getContracttype,
    createContracttype,
    updateContracttype,
    archiveContracttype,
  };
};
