export const useExemptionHelper = () => {
  const client = useSanctumClient();
  const base = '/api/v1/exemptions';

  const request = async (url, options = {}) => {
    try {
      return { data: await client(url, options), error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    list: () => request(base),
    board: () => request(`${base}?per_page=100`),
    myHandlerQueue: () => request(`${base}/my-handler-queue?per_page=100`),
    show: uuid => request(`${base}/${uuid}`),
    actions: uuid => request(`${base}/${uuid}/workflow/actions`),
    transitions: uuid => request(`${base}/${uuid}/transitions`),
    recommendations: uuid => request(`${base}/${uuid}/recommendations`),
    eligibleNextActors: (uuid, stage) => request(`${base}/${uuid}/workflow/eligible-next-actors?stage=${encodeURIComponent(stage)}`),
    transition: (uuid, action, comment = null, extra = {}) => request(`${base}/${uuid}/transition`, { method: 'POST', body: { action, comment, ...extra } }),
  };
};
