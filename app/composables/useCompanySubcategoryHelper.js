export const useCompanySubcategoryHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getCompanySubcategories = async ($search = '', $page = 1, $perPage = 10, $companycategoryId = '') => {
    let url = `/api/v1/companysubcategories?search=${$search}&page=${$page}&perPage=${$perPage}`;
    if ($companycategoryId) url += `&companycategory_id=${$companycategoryId}`;
    try {
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company subcategories.') };
    }
  };

  const getCompanySubcategory = async (id) => {
    try {
      const data = await client(`/api/v1/companysubcategories/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company subcategory.') };
    }
  };

  const createCompanySubcategory = async (payload) => {
    try {
      const data = await client('/api/v1/companysubcategories', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create company subcategory.') };
    }
  };

  const updateCompanySubcategory = async (id, payload) => {
    try {
      const data = await client(`/api/v1/companysubcategories/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update company subcategory.') };
    }
  };

  const deleteCompanySubcategory = async (id) => {
    try {
      const data = await client(`/api/v1/companysubcategories/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete company subcategory.') };
    }
  };

  return {
    getCompanySubcategories,
    getCompanySubcategory,
    createCompanySubcategory,
    updateCompanySubcategory,
    deleteCompanySubcategory,
  };
};
