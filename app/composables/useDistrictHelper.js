export const useDistrictHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getDistricts = async ($search = '', $page = 1, $perPage = 10, $provinceId = '') => {
    let url = `/api/v1/districts?search=${$search}&page=${$page}&perPage=${$perPage}`;
    if ($provinceId) url += `&province_id=${$provinceId}`;
    try {
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load districts.') };
    }
  };

  const getDistrict = async (id) => {
    try {
      const data = await client(`/api/v1/districts/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load district.') };
    }
  };

  const createDistrict = async (payload) => {
    try {
      const data = await client('/api/v1/districts', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create district.') };
    }
  };

  const updateDistrict = async (id, payload) => {
    try {
      const data = await client(`/api/v1/districts/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update district.') };
    }
  };

  const deleteDistrict = async (id) => {
    try {
      const data = await client(`/api/v1/districts/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete district.') };
    }
  };

  return {
    getDistricts,
    getDistrict,
    createDistrict,
    updateDistrict,
    deleteDistrict,
  };
};
