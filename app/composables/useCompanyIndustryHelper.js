export const useCompanyIndustryHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getCompanyIndustries = async ($search = '', $page = 1, $perPage = 10) => {
    try {
      const data = await client(`/api/v1/companyindustries?search=${$search}&page=${$page}&perPage=${$perPage}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company industries.') };
    }
  };

  const getCompanyIndustry = async (id) => {
    try {
      const data = await client(`/api/v1/companyindustries/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company industry.') };
    }
  };

  const createCompanyIndustry = async (payload) => {
    try {
      const data = await client('/api/v1/companyindustries', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create company industry.') };
    }
  };

  const updateCompanyIndustry = async (id, payload) => {
    try {
      const data = await client(`/api/v1/companyindustries/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update company industry.') };
    }
  };

  const deleteCompanyIndustry = async (id) => {
    try {
      const data = await client(`/api/v1/companyindustries/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete company industry.') };
    }
  };

  return {
    getCompanyIndustries,
    getCompanyIndustry,
    createCompanyIndustry,
    updateCompanyIndustry,
    deleteCompanyIndustry,
  };
};
