export const useCompetitionScopeThresholdHelper = () => {
  const client = useSanctumClient();

  const request = async (url, options = {}) => {
    try {
      const data = await client(url, options);
      return { data: ref(data), error: ref(null) };
    } catch (error) {
      return { data: ref(null), error: ref(error) };
    }
  };

  return {
    getAll: () => request('/api/v1/competition-scope-thresholds'),
    create: payload => request('/api/v1/competition-scope-thresholds', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/api/v1/competition-scope-thresholds/${id}`, { method: 'PUT', body: payload }),
    remove: id => request(`/api/v1/competition-scope-thresholds/${id}`, { method: 'DELETE' }),
    autofill: () => request('/api/v1/competition-scope-thresholds/autofill', { method: 'POST' }),
    getGroups: () => request('/api/v1/procurement-groups/list'),
    getCurrencies: () => request('/api/v1/currencies/list'),
  };
};
