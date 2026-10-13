export const useProcurementLawHelper = () => {
  const client = useSanctumClient();

  const getSources = async () => {
    try {
      const data = await client('/api/v1/procurement-law-sources', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const uploadSource = async (payload) => {
    try {
      const data = await client('/api/v1/procurement-law-sources', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const reindexSource = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-law-sources/${id}/reindex`, { method: 'POST' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveSource = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-law-sources/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getSources, uploadSource, reindexSource, archiveSource };
};
