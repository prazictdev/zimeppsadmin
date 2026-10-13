export const useCompanyHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getCompanies = async ($search = '', $page = 1, $perPage = 10, $filters = {}) => {
    const params = new URLSearchParams({
      search: $search ?? '',
      page: String($page ?? 1),
      perPage: String($perPage ?? 10),
    });
    if ($filters?.country) params.append('country', $filters.country);
    if ($filters?.companycategory_id) params.append('companycategory_id', String($filters.companycategory_id));
    if ($filters?.companysubcategory_id) params.append('companysubcategory_id', String($filters.companysubcategory_id));
    if ($filters?.province_id) params.append('province_id', String($filters.province_id));
    if ($filters?.district_id) params.append('district_id', String($filters.district_id));
    if ($filters?.accounttype_id) params.append('accounttype_id', String($filters.accounttype_id));
    try {
      const data = await client(`/api/v1/companies?${params.toString()}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load companies.') };
    }
  };

  const getCompany = async (id) => {
    try {
      const data = await client(`/api/v1/companies/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company.') };
    }
  };

  const createCompany = async (payload) => {
    try {
      const data = await client('/api/v1/companies', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create company.') };
    }
  };

  const updateCompany = async (id, payload) => {
    try {
      const data = await client(`/api/v1/companies/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update company.') };
    }
  };

  const deleteCompany = async (id) => {
    try {
      const data = await client(`/api/v1/companies/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete company.') };
    }
  };

  const getBidderProfile = async (id) => {
    try {
      const data = await client(`/api/v1/companies/${id}/bidder-profile`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load bidder profile.') };
    }
  };

  const getEntityProfile = async (id, year) => {
    try {
      const data = await client(`/api/v1/companies/${id}/entity-profile?year=${year}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load procurement entity profile.') };
    }
  };

  const getCompanymodules = async (id) => {
    try {
      const data = await client(`/api/v1/companies/${id}/modules`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load company modules.') };
    }
  };

  const getAvailableAccounttypes = async (id) => {
    try {
      const data = await client(`/api/v1/companies/${id}/available-accounttypes`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load available account types.') };
    }
  };

  const getAssignedAccounttypes = async (id) => {
    try {
      const data = await client(`/api/v1/companies/${id}/accounttypes`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load assigned account types.') };
    }
  };

  const assignAccounttypes = async (id, accounttypeIds = []) => {
    try {
      const data = await client(`/api/v1/companies/${id}/assign-accounttypes`, {
        method: 'POST',
        body: { accounttype_ids: accounttypeIds },
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign account types.') };
    }
  };

  const unassignAccounttype = async (companyId, accounttypeId) => {
    try {
      const data = await client(`/api/v1/companies/${companyId}/unassign-accounttype/${accounttypeId}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to unassign account type.') };
    }
  };

  return {
    getCompanies,
    getCompany,
    getBidderProfile,
    getEntityProfile,
    createCompany,
    updateCompany,
    deleteCompany,
    getCompanymodules,
    getAvailableAccounttypes,
    getAssignedAccounttypes,
    assignAccounttypes,
    unassignAccounttype,
  };
};
