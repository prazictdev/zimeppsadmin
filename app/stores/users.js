import { defineStore } from 'pinia';

export const useUserStore = defineStore('users', () => {
  const users = ref(null);
  const accountOptions = ref([]);
  const roleOptions = ref([]);
  const loading = ref(false);
  const optionsLoading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const helper = useUserHelper();
  const toast = useToast();

  const notifyError = (title, message) => {
    toast.error({ title, message, position: 'topRight', layout: 2 });
  };

  const fetchUsers = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    try {
      const { ok, data, error } = await helper.getUsers(search.value, page, perPage.value);
      if (ok) users.value = data;
      else notifyError('Unable to load users', error);
    } finally {
      loading.value = false;
    }
  };

  const loadAccountOptions = async (query = '') => {
    optionsLoading.value = true;
    try {
      const { ok, data, error } = await helper.getAccountOptions(query);
      if (ok) accountOptions.value = data;
      else notifyError('Unable to load accounts', error);
    } finally {
      optionsLoading.value = false;
    }
  };

  const loadRoleOptions = async () => {
    const { ok, data, error } = await helper.getRoleOptions();
    if (ok) roleOptions.value = data;
    else notifyError('Unable to load roles', error);
  };

  const findOne = async (id) => {
    const { ok, data, error } = await helper.getUser(id);
    if (!ok) notifyError('Unable to load user', error);
    return ok ? data : null;
  };

  const create = async (payload) => {
    const { ok, data, error } = await helper.createUser(payload);
    if (!ok) {
      notifyError('User creation failed', error);
      return false;
    }
    toast.success({ title: 'User created', message: data?.message ?? 'The user was created and sent a temporary password.' });
    await fetchUsers(1);
    return true;
  };

  const update = async (id, payload) => {
    const { ok, data, error } = await helper.updateUser(id, payload);
    if (!ok) {
      notifyError('User update failed', error);
      return false;
    }
    toast.success({ title: 'User updated', message: data?.message ?? 'User details were updated.' });
    await fetchUsers(currentPage.value);
    return true;
  };

  const syncRoles = async (user, roleIds) => {
    const currentIds = (user.roles ?? []).map(role => role.id);
    const additions = roleIds.filter(id => !currentIds.includes(id));
    const removals = currentIds.filter(id => !roleIds.includes(id));

    if (additions.length) {
      const { ok, error } = await helper.assignRoles(user.id, additions);
      if (!ok) {
        notifyError('Role update failed', error);
        return false;
      }
    }

    for (const roleId of removals) {
      const { ok, error } = await helper.unassignRole(user.id, roleId);
      if (!ok) {
        notifyError('Role update failed', error);
        return false;
      }
    }

    toast.success({ title: 'Access updated', message: 'The user roles were updated.' });
    await fetchUsers(currentPage.value);
    return true;
  };

  const remove = async (id) => {
    const { ok, data, error } = await helper.deleteUser(id);
    if (!ok) {
      notifyError('User deletion failed', error);
      return false;
    }
    const wasDeactivated = data?.data?.action === 'deactivated';
    toast.success({
      title: wasDeactivated ? 'User deactivated' : 'User deleted',
      message: data?.message ?? 'User access was removed.',
    });
    await fetchUsers(currentPage.value);
    return true;
  };

  const unlock = async (id) => {
    const { ok, data, error } = await helper.unlockUser(id);
    if (!ok) {
      notifyError('Unable to unlock user', error);
      return false;
    }
    toast.success({
      title: 'User unlocked',
      message: data?.message ?? 'The user can try signing in again immediately.',
    });
    await fetchUsers(currentPage.value);
    return true;
  };

  const sendPasswordReset = async (email) => {
    const { ok, data, error } = await helper.resetPassword(email);
    if (!ok) {
      notifyError('Password reset failed', error);
      return false;
    }
    toast.success({ title: 'Password reset sent', message: data?.message ?? `A reset link was sent to ${email}.` });
    return true;
  };

  return {
    users,
    accountOptions,
    roleOptions,
    loading,
    optionsLoading,
    currentPage,
    search,
    fetchUsers,
    loadAccountOptions,
    loadRoleOptions,
    findOne,
    create,
    update,
    syncRoles,
    unlock,
    remove,
    sendPasswordReset,
  };
});
