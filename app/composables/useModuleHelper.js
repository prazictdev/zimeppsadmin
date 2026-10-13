export const useModuleHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getModules = async ($search = '', $page = 1, $perPage = 10) => {
    try {
      const data = await client(`/api/v1/systemmodules?search=${$search}&page=${$page}&perPage=${$perPage}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load modules.') };
    }
  };

  const getModule = async (id) => {
    try {
      const data = await client(`/api/v1/systemmodules/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load module.') };
    }
  };

  const getunassignedmodules = async (accounttypeId) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/unassignedmodules`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load unassigned modules.') };
    }
  };

  const createModule = async (payload) => {
    try {
      const data = await client('/api/v1/systemmodules', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create module.') };
    }
  };

  const updateModule = async (id, payload) => {
    try {
      const data = await client(`/api/v1/systemmodules/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update module.') };
    }
  };

  const deleteModule = async (id) => {
    try {
      const data = await client(`/api/v1/systemmodules/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete module.') };
    }
  };

  const getmodulebyaccounttype = async (accounttypeId, roleId = null) => {
    const url = roleId
      ? `/api/v1/systemmodules/${accounttypeId}/modules/${roleId}`
      : `/api/v1/systemmodules/${accounttypeId}/modules`;
    try {
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load modules by account type.') };
    }
  };

  return {
    getModules,
    getModule,
    getunassignedmodules,
    createModule,
    updateModule,
    deleteModule,
    getmodulebyaccounttype,
  };
};
