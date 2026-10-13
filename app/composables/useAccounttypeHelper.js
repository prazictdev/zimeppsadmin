export const useAccounttypeHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getAccounttypes = async ($search = '', $page = 1, $perPage = 10) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes?search=${$search}&page=${$page}&perPage=${$perPage}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load account types.') };
    }
  };

  const getallaccounttypes = async () => {
    try {
      const data = await client('/api/v1/systemaccounttypes/all', { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load account types.') };
    }
  };

  const getAccounttype = async (id) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load account type.') };
    }
  };

  const createAccounttype = async (payload) => {
    try {
      const data = await client('/api/v1/systemaccounttypes', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create account type.') };
    }
  };

  const updateAccounttype = async (id, payload) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update account type.') };
    }
  };

  const deleteAccounttype = async (id) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete account type.') };
    }
  };

  const assignModules = async (accounttypeId, modules) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/assignmodules`, {
        method: 'POST',
        body: { modules },
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign modules.') };
    }
  };

  const unasignModules = async (accounttypeId, moduleId) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/unassignmodule/${moduleId}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to unassign module.') };
    }
  };

  // roles must be an array of { id: number, is_primary: boolean }
  const assignRoles = async (accounttypeId, roles) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/assignroles`, {
        method: 'POST',
        body: { roles },
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign roles.') };
    }
  };

  const unassignRole = async (accounttypeId, roleId) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/unassignrole/${roleId}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to unassign role.') };
    }
  };

  const assignPermissions = async (accounttypeId, permissions) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/assignpermissions`, {
        method: 'POST',
        body: permissions,
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign permissions.') };
    }
  };

  const unassignPermission = async (accounttypeId, permissionId) => {
    try {
      const data = await client(`/api/v1/systemaccounttypes/${accounttypeId}/unassignpermission/${permissionId}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to unassign permission.') };
    }
  };

  return {
    getAccounttypes,
    getallaccounttypes,
    createAccounttype,
    updateAccounttype,
    deleteAccounttype,
    getAccounttype,
    assignModules,
    unasignModules,
    assignRoles,
    unassignRole,
    assignPermissions,
    unassignPermission,
  };
};
