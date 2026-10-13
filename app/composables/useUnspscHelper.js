export const useUnspscHelper = () => {
  const client = useSanctumClient();

  const getUnspscs = async ({ page = 1, perPage = 25, search = '', status = '' } = {}) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(perPage),
      });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await client(`/api/v1/unspscs?${params.toString()}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getUnspsc = async (id) => {
    try {
      const data = await client(`/api/v1/unspscs/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createUnspsc = async (payload) => {
    try {
      const data = await client('/api/v1/unspscs', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateUnspsc = async (id, payload) => {
    try {
      const data = await client(`/api/v1/unspscs/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveUnspsc = async (id) => {
    try {
      const data = await client(`/api/v1/unspscs/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const importUnspscs = async (file, catalogue = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('catalogue_version', catalogue.catalogue_version || '');
      formData.append('catalogue_source', catalogue.catalogue_source || '');
      const data = await client('/api/v1/unspscs/import', { method: 'POST', body: formData });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getUnspscs,
    getUnspsc,
    createUnspsc,
    updateUnspsc,
    archiveUnspsc,
    importUnspscs,
  };
};
