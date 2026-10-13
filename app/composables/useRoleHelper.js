export const useRoleHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getRoles = async ($search = '', $page = 1, $perPage = 10) => {
    try {
      const data = await client(`/api/v1/systemroles?search=${$search}&page=${$page}&perPage=${$perPage}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load roles.') };
    }
  };

  const getRole = async (id) => {
    try {
      const data = await client(`/api/v1/systemroles/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load role.') };
    }
  };

  const createRole = async (payload) => {
    try {
      const data = await client('/api/v1/systemroles', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create role.') };
    }
  };

  const updateRole = async (id, payload) => {
    try {
      const data = await client(`/api/v1/systemroles/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update role.') };
    }
  };

  const deleteRole = async (id) => {
    try {
      const data = await client(`/api/v1/systemroles/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete role.') };
    }
  };

  const getUnassignedRoles = async (accounttypeId) => {
    try {
      const data = await client(`/api/v1/systemroles/${accounttypeId}/unassignedroles`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load unassigned roles.') };
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

  return {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getUnassignedRoles,
    unassignRole,
  };
};
