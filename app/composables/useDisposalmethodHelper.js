export const useDisposalmethodHelper = () => {
  const client = useSanctumClient();

  const getDisposalmethods = async () => {
    try {
      const data = await client('/api/v1/disposal-methods/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getDisposalmethod = async (id) => {
    try {
      const data = await client(`/api/v1/disposal-methods/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createDisposalmethod = async (payload) => {
    try {
      const data = await client('/api/v1/disposal-methods', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateDisposalmethod = async (id, payload) => {
    try {
      const data = await client(`/api/v1/disposal-methods/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveDisposalmethod = async (id) => {
    try {
      const data = await client(`/api/v1/disposal-methods/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getDisposalmethods,
    getDisposalmethod,
    createDisposalmethod,
    updateDisposalmethod,
    archiveDisposalmethod,
  };
};
