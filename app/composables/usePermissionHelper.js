export const usePermissionHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getPermissions = async (id) => {
    try {
      const data = await client(`/api/v1/systempermissions?submodule_id=${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load permissions.') };
    }
  };

  const editPermission = async (id) => {
    try {
      const data = await client(`/api/v1/systempermissions/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load permission.') };
    }
  };

  const createPermission = async (payload) => {
    try {
      const data = await client('/api/v1/systempermissions', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create permission.') };
    }
  };

  const updatePermission = async (id, payload) => {
    try {
      const data = await client(`/api/v1/systempermissions/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update permission.') };
    }
  };

  const deletePermission = async (id) => {
    try {
      const data = await client(`/api/v1/systempermissions/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete permission.') };
    }
  };

  const getaccounttypepermissions = async (accounttypeId, roleId = null) => {
    const url = roleId
      ? `/api/v1/systemaccounttypes/${accounttypeId}/assignedpermissions/${roleId}`
      : `/api/v1/systemaccounttypes/${accounttypeId}/assignedpermissions`;
    try {
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load account type permissions.') };
    }
  };

  return {
    getPermissions,
    editPermission,
    createPermission,
    updatePermission,
    deletePermission,
    getaccounttypepermissions,
  };
};
