export const useCompanyCategoryHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getCompanyCategories = async ($search = '', $page = 1, $perPage = 10) => {
    try {
      const data = await client(`/api/v1/companycategories?search=${$search}&page=${$page}&perPage=${$perPage}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company categories.') };
    }
  };

  const getCompanyCategory = async (id) => {
    try {
      const data = await client(`/api/v1/companycategories/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company category.') };
    }
  };

  const createCompanyCategory = async (payload) => {
    try {
      const data = await client('/api/v1/companycategories', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create company category.') };
    }
  };

  const updateCompanyCategory = async (id, payload) => {
    try {
      const data = await client(`/api/v1/companycategories/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update company category.') };
    }
  };

  const deleteCompanyCategory = async (id) => {
    try {
      const data = await client(`/api/v1/companycategories/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete company category.') };
    }
  };

  const getSubcategoriesByCategory = async (idOrUuid) => {
    try {
      const data = await client(`/api/v1/companycategories/${idOrUuid}/companysubcategories`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load subcategories.') };
    }
  };

  return {
    getCompanyCategories,
    getCompanyCategory,
    createCompanyCategory,
    updateCompanyCategory,
    deleteCompanyCategory,
    getSubcategoriesByCategory,
  };
};
