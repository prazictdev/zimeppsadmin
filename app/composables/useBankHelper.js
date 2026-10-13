export const useBankHelper = () => {
  const client = useSanctumClient();

  const getBanks = async () => {
    try {
      const data = await client('/api/v1/banks', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getBank = async (id) => {
    try {
      const data = await client(`/api/v1/banks/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  return { getBanks, getBank };
};
