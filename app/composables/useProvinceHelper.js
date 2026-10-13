export const useProvinceHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getProvinces = async ($search = '', $page = 1, $perPage = 10) => {
    try {
      const data = await client(`/api/v1/provinces?search=${$search}&page=${$page}&perPage=${$perPage}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load provinces.') };
    }
  };

  const getProvince = async (id) => {
    try {
      const data = await client(`/api/v1/provinces/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load province.') };
    }
  };

  const createProvince = async (payload) => {
    try {
      const data = await client('/api/v1/provinces', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create province.') };
    }
  };

  const updateProvince = async (id, payload) => {
    try {
      const data = await client(`/api/v1/provinces/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update province.') };
    }
  };

  const deleteProvince = async (id) => {
    try {
      const data = await client(`/api/v1/provinces/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete province.') };
    }
  };

  const getDistrictsByProvince = async (idOrUuid) => {
    try {
      const data = await client(`/api/v1/provinces/${idOrUuid}/districts`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load districts.') };
    }
  };

  return {
    getProvinces,
    getProvince,
    createProvince,
    updateProvince,
    deleteProvince,
    getDistrictsByProvince,
  };
};
