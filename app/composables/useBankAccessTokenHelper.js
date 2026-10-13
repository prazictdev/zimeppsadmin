export const useBankAccessTokenHelper = () => {
  const client = useSanctumClient();

  const getBankAccessTokens = async () => {
    try {
      const data = await client('/api/v1/bank-access-tokens', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getBankAccessToken = async (id) => {
    try {
      const data = await client(`/api/v1/bank-access-tokens/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createBankAccessToken = async (payload) => {
    try {
      const data = await client('/api/v1/bank-access-tokens', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateBankAccessToken = async (id, payload) => {
    try {
      const data = await client(`/api/v1/bank-access-tokens/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteBankAccessToken = async (id) => {
    try {
      const data = await client(`/api/v1/bank-access-tokens/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const regenerateBankAccessToken = async (id) => {
    try {
      const data = await client(`/api/v1/bank-access-tokens/${id}/regenerate`, { method: 'POST' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getBankAccessTokens,
    getBankAccessToken,
    createBankAccessToken,
    updateBankAccessToken,
    deleteBankAccessToken,
    regenerateBankAccessToken,
  };
};
