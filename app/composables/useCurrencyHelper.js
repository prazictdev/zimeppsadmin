export const useCurrencyHelper = () => {
  const client = useSanctumClient();

  const getCurrencies = async () => {
    try {
      const data = await client('/api/v1/currencies', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getCurrency = async (id) => {
    try {
      const data = await client(`/api/v1/currencies/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  return { getCurrencies, getCurrency };
};
