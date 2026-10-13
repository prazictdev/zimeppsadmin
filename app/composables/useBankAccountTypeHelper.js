export const useBankAccountTypeHelper = () => {
  const client = useSanctumClient();

  const getBankAccountTypes = async () => {
    try {
      const data = await client('/api/v1/bank-account-types', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getBankAccountType = async (id) => {
    try {
      const data = await client(`/api/v1/bank-account-types/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  return { getBankAccountTypes, getBankAccountType };
};
