export const useSubmoduleHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getSubModules = async (id, search = '') => {
    try {
      const data = await client(`/api/v1/systemsubmodules?module_id=${id}&search=${search}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load submodules.') };
    }
  };

  const getSubModule = async (id) => {
    try {
      const data = await client(`/api/v1/systemsubmodules/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load submodule.') };
    }
  };

  const createSubModule = async (payload) => {
    try {
      const data = await client('/api/v1/systemsubmodules', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create submodule.') };
    }
  };

  const updateSubModule = async (id, payload) => {
    try {
      const data = await client(`/api/v1/systemsubmodules/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update submodule.') };
    }
  };

  const deleteSubModule = async (id) => {
    try {
      const data = await client(`/api/v1/systemsubmodules/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete submodule.') };
    }
  };

  return {
    getSubModules,
    getSubModule,
    createSubModule,
    updateSubModule,
    deleteSubModule,
  };
};
