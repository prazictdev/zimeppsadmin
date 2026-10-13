export const useDisposalreasonHelper = () => {
  const client = useSanctumClient();

  const getDisposalreasons = async () => {
    try {
      const data = await client('/api/v1/disposal-reasons/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getDisposalreason = async (id) => {
    try {
      const data = await client(`/api/v1/disposal-reasons/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createDisposalreason = async (payload) => {
    try {
      const data = await client('/api/v1/disposal-reasons', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateDisposalreason = async (id, payload) => {
    try {
      const data = await client(`/api/v1/disposal-reasons/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveDisposalreason = async (id) => {
    try {
      const data = await client(`/api/v1/disposal-reasons/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getDisposalreasons,
    getDisposalreason,
    createDisposalreason,
    updateDisposalreason,
    archiveDisposalreason,
  };
};
