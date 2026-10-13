export const useSuspenseHelper = () => {
  const client = useSanctumClient();

  const getSuspenseRecords = async () => {
    try {
      const data = await client('/api/v1/suspense', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSuspenseRecord = async (id) => {
    try {
      const data = await client(`/api/v1/suspense/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const claimBankTransaction = async (id, payload) => {
    try {
      const data = await client(`/api/v1/bank-transactions/${id}/claim`, { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getSuspenseRecords, getSuspenseRecord, claimBankTransaction };
};
