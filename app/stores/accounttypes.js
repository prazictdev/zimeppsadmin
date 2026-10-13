import { defineStore } from 'pinia';

export const useAccounttypeStore = defineStore('accounttype', () => {
  const accounttypes = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getAccounttypes,
    getallaccounttypes,
    createAccounttype,
    updateAccounttype,
    deleteAccounttype,
    getAccounttype,
  } = useAccounttypeHelper();
  const toast = useToast();

  const fetchAccounttypes = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getAccounttypes(search.value, page, perPage.value);
    if (ok) {
      accounttypes.value = data;
    }
    loading.value = false;
  };

  const fetchAllAccounttypes = async () => {
    const { ok, data } = await getallaccounttypes();
    if (ok) {
      accounttypes.value = data;
    }
  };

  const setSearch = async (value) => {
    search.value = value;
    await fetchAccounttypes(1);
  };

  const create = async (payload) => {
    const { ok, data, error } = await createAccounttype(payload);
    if (ok) {
      if (data?.status === 'success') {
        toast.success({ title: 'Account type created', message: data.message });
      } else if (data?.status === 'error') {
        toast.error({ title: 'Account type creation failed', message: data.message });
      }
      await fetchAccounttypes(1);
    } else {
      toast.error({ title: 'Account type creation failed', message: error ?? 'Account type creation failed' });
    }
  };

  const update = async (id, payload) => {
    const { ok } = await updateAccounttype(id, payload);
    if (ok) {
      await fetchAccounttypes(currentPage.value);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteAccounttype(id);
    if (ok) {
      await fetchAccounttypes(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getAccounttype(id);
    return ok ? data : null;
  };

  return {
    accounttypes,
    loading,
    currentPage,
    perPage,
    search,
    fetchAccounttypes,
    fetchAllAccounttypes,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
