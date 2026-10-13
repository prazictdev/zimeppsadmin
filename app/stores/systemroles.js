import { defineStore } from 'pinia';

export const useSystemroleStore = defineStore('systemrole', () => {
  const systemroles = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleHelper();
  const toast = useToast();

  const fetchRoles = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getRoles(search.value, page, perPage.value);
    if (ok) {
      systemroles.value = data;
    }
    loading.value = false;
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createRole(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Role created', message: data.message });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Role creation failed', message: data.message });
        }
        await fetchRoles(1);
      } else {
        toast.error({ title: 'Role creation failed', message: error ?? 'Role creation failed' });
      }
    } catch (err) {
      toast.error({ title: 'Role creation failed', message: err?.message });
    }
  };

  const update = async (id, payload) => {
    const { ok } = await updateRole(id, payload);
    if (ok) {
      await fetchRoles(currentPage.value);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteRole(id);
    if (ok) {
      await fetchRoles(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getRole(id);
    return ok ? data : null;
  };

  return {
    systemroles,
    loading,
    currentPage,
    perPage,
    search,
    fetchRoles,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
