export const useUserHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const buildQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
    return query.toString();
  };

  const getUsers = async ($search = '', $page = 1, $perPage = 10) => {
    const qs = buildQuery({ search: $search, page: $page, perPage: $perPage });
    const url = `/api/v1/users${qs ? `?${qs}` : ''}`;
    try {
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load users.') };
    }
  };

  const getUser = async (id) => {
    try {
      const data = await client(`/api/v1/users/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load user.') };
    }
  };

  const getAccountOptions = async (search = '') => {
    const qs = buildQuery({ search, limit: 30 });
    try {
      const data = await client(`/api/v1/users/account-options?${qs}`, { method: 'GET' });
      return { ok: true, data: data?.data ?? [], error: null };
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to load account options.') };
    }
  };

  const getRoleOptions = async () => {
    try {
      const data = await client('/api/v1/users/role-options', { method: 'GET' });
      return { ok: true, data: data?.data ?? [], error: null };
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to load role options.') };
    }
  };

  const createUser = async (payload) => {
    try {
      const data = await client('/api/v1/users', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create user.') };
    }
  };

  const updateUser = async (id, payload) => {
    try {
      const data = await client(`/api/v1/users/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update user.') };
    }
  };

  const deleteUser = async (id) => {
    try {
      const data = await client(`/api/v1/users/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to delete user.') };
    }
  };

  const unlockUser = async (id) => {
    try {
      const data = await client(`/api/v1/users/${id}/unlock`, { method: 'POST' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to clear the temporary login lock.') };
    }
  };

  const assignRoles = async (userId, roleIds = []) => {
    try {
      const data = await client(`/api/v1/users/${userId}/assign-roles`, {
        method: 'POST',
        body: { role_ids: roleIds },
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign roles.') };
    }
  };

  const unassignRole = async (userId, roleId) => {
    try {
      const data = await client(`/api/v1/users/${userId}/unassign-role/${roleId}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to unassign role.') };
    }
  };

  const assignPermissions = async (userId, permissionIds = []) => {
    try {
      const data = await client(`/api/v1/users/${userId}/assign-permissions`, {
        method: 'POST',
        body: { permission_ids: permissionIds },
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign permissions.') };
    }
  };

  const unassignPermission = async (userId, permissionId) => {
    try {
      const data = await client(`/api/v1/users/${userId}/unassign-permission/${permissionId}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to unassign permission.') };
    }
  };

  const resetPassword = async (email) => {
    try {
      const data = await client('/api/password-resets/admin-request', { method: 'POST', body: { email } });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to send password reset.') };
    }
  };

  return {
    getUsers,
    getUser,
    getAccountOptions,
    getRoleOptions,
    createUser,
    updateUser,
    unlockUser,
    deleteUser,
    assignRoles,
    unassignRole,
    assignPermissions,
    unassignPermission,
    resetPassword,
  };
};
