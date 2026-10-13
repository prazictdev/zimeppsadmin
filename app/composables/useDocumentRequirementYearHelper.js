export const useDocumentRequirementYearHelper = () => {
  const client = useSanctumClient();

  // ─── Years ────────────────────────────────────────────────────────────────
  const getYears = async ({ page = 1, perPage = 25, search = '', status = '' } = {}) => {
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await client(`/api/v1/document-requirement-years?${params.toString()}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getYearsList = async () => {
    try {
      const data = await client('/api/v1/document-requirement-years/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getYear = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-years/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createYear = async (payload) => {
    try {
      const data = await client('/api/v1/document-requirement-years', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateYear = async (id, payload) => {
    try {
      const data = await client(`/api/v1/document-requirement-years/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveYear = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-years/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const activateYear = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-years/${id}/activate`, { method: 'POST' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const cloneYear = async (id, payload) => {
    try {
      const data = await client(`/api/v1/document-requirement-years/${id}/clone`, { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  // ─── Items ────────────────────────────────────────────────────────────────
  const getItems = async ({ yearId, page = 1, perPage = 50, search = '' } = {}) => {
    try {
      const params = new URLSearchParams({
        documentrequirementyear_id: String(yearId),
        page: String(page),
        per_page: String(perPage),
      });
      if (search) params.set('search', search);
      const data = await client(`/api/v1/document-requirement-year-items?${params.toString()}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getItem = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-year-items/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createItem = async (payload) => {
    try {
      const data = await client('/api/v1/document-requirement-year-items', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateItem = async (id, payload) => {
    try {
      const data = await client(`/api/v1/document-requirement-year-items/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteItem = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-year-items/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getYears,
    getYearsList,
    getYear,
    createYear,
    updateYear,
    archiveYear,
    activateYear,
    cloneYear,
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem,
  };
};
