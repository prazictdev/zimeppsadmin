export const useBidopeningtypeHelper = () => {
  const client = useSanctumClient();

  const getBidopeningtypes = async () => {
    try {
      const data = await client('/api/v1/bid-opening-types/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getBidopeningtype = async (id) => {
    try {
      const data = await client(`/api/v1/bid-opening-types/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createBidopeningtype = async (payload) => {
    try {
      const data = await client('/api/v1/bid-opening-types', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateBidopeningtype = async (id, payload) => {
    try {
      const data = await client(`/api/v1/bid-opening-types/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveBidopeningtype = async (id) => {
    try {
      const data = await client(`/api/v1/bid-opening-types/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getBidopeningtypes,
    getBidopeningtype,
    createBidopeningtype,
    updateBidopeningtype,
    archiveBidopeningtype,
  };
};
