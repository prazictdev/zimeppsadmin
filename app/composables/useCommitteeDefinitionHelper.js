export const useCommitteeDefinitionHelper = () => {
  const client = useSanctumClient();
  const call = async (url, options = {}) => {
    try {
      const data = await client(url, options);
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getCommittees: () => call('/api/v1/committees', { method: 'GET' }),
    createCommittee: payload => call('/api/v1/committees', { method: 'POST', body: payload }),
    updateCommittee: (id, payload) => call(`/api/v1/committees/${id}`, { method: 'PUT', body: payload }),
    deleteCommittee: id => call(`/api/v1/committees/${id}`, { method: 'DELETE' }),
  };
};
