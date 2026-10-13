export const useNsplHelper = () => {
  const client = useSanctumClient();

  // ─── Categories ───────────────────────────────────────────────────────────
  const getCategories = async () => {
    try {
      const data = await client('/api/v1/nspl/categories', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  // ─── Editions ─────────────────────────────────────────────────────────────
  const getEditions = async ({ page = 1, perPage = 25, search = '', status = '' } = {}) => {
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const data = await client(`/api/v1/nspl/editions?${params.toString()}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getEditionsList = async () => {
    try {
      const data = await client('/api/v1/nspl/editions/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getEdition = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/editions/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createEdition = async (payload) => {
    try {
      const data = await client('/api/v1/nspl/editions', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateEdition = async (id, payload) => {
    try {
      const data = await client(`/api/v1/nspl/editions/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveEdition = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/editions/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const publishEdition = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/editions/${id}/publish`, { method: 'POST' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const cloneEdition = async (id, payload) => {
    try {
      const data = await client(`/api/v1/nspl/editions/${id}/clone`, { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  // ─── Divisions ────────────────────────────────────────────────────────────
  const getDivisionsByEdition = async (editionId) => {
    try {
      const data = await client(`/api/v1/nspl/editions/${editionId}/divisions`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createDivision = async (payload) => {
    try {
      const data = await client('/api/v1/nspl/divisions', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateDivision = async (id, payload) => {
    try {
      const data = await client(`/api/v1/nspl/divisions/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteDivision = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/divisions/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  // ─── Sections ─────────────────────────────────────────────────────────────
  const getSectionsByDivision = async (divisionId) => {
    try {
      const data = await client(`/api/v1/nspl/divisions/${divisionId}/sections`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSection = async (payload) => {
    try {
      const data = await client('/api/v1/nspl/sections', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSection = async (id, payload) => {
    try {
      const data = await client(`/api/v1/nspl/sections/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSection = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/sections/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  // ─── Products ─────────────────────────────────────────────────────────────
  const getProducts = async ({
    editionId,
    page = 1,
    perPage = 25,
    search = '',
    divisionId = null,
    sectionId = null,
    priced = '',
  } = {}) => {
    try {
      const params = new URLSearchParams({
        edition_id: String(editionId),
        page: String(page),
        per_page: String(perPage),
      });
      if (search) params.set('search', search);
      if (divisionId) params.set('division_id', String(divisionId));
      if (sectionId) params.set('section_id', String(sectionId));
      if (priced) params.set('priced', priced);
      const data = await client(`/api/v1/nspl/products?${params.toString()}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getProduct = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/products/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createProduct = async (payload) => {
    try {
      const data = await client('/api/v1/nspl/products', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateProduct = async (id, payload) => {
    try {
      const data = await client(`/api/v1/nspl/products/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteProduct = async (id) => {
    try {
      const data = await client(`/api/v1/nspl/products/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const importProducts = async (editionId, file) => {
    try {
      const formData = new FormData();
      formData.append('edition_id', String(editionId));
      formData.append('file', file);
      const data = await client('/api/v1/nspl/products/import', { method: 'POST', body: formData });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getCategories,
    getEditions,
    getEditionsList,
    getEdition,
    createEdition,
    updateEdition,
    archiveEdition,
    publishEdition,
    cloneEdition,
    getDivisionsByEdition,
    createDivision,
    updateDivision,
    deleteDivision,
    getSectionsByDivision,
    createSection,
    updateSection,
    deleteSection,
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts,
  };
};
