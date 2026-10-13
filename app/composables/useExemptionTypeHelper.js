export const useExemptionTypeHelper = () => {
  const client = useSanctumClient();
  const base = '/api/v1/exemption-types';
  const request = async (url, options = {}) => {
    try { return { data: await client(url, options), error: null }; }
    catch (error) { return { data: null, error }; }
  };

  return {
    list: () => request(base),
    create: payload => request(base, { method: 'POST', body: payload }),
    update: (id, payload) => request(`${base}/${id}`, { method: 'PUT', body: payload }),
    archive: id => request(`${base}/${id}`, { method: 'DELETE' }),
  };
};
