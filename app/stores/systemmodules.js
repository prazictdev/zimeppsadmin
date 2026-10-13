import { defineStore } from 'pinia';

export const useSystemmoduleStore = defineStore('systemmodule', () => {
  const systemmodules = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getModules,
    createModule,
    updateModule,
    deleteModule,
    getModule,
  } = useModuleHelper();
  const toast = useToast();

  const fetchModules = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getModules(search.value, page, perPage.value);
    if (ok) {
      systemmodules.value = data;
    }
    loading.value = false;
  };

  const setSearch = async (value) => {
    search.value = value;
    await fetchModules(1);
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createModule(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'System module created', message: data.message });
        } else if (data?.status === 'error') {
          toast.error({ title: 'System module creation failed', message: data.message });
        }
        await fetchModules(1);
      } else {
        toast.error({ title: 'System module creation failed', message: error ?? 'Module creation failed' });
      }
    } catch (err) {
      console.log(err);
      toast.error({ title: 'System module creation failed', message: err.message });
    }
  };

  const update = async (id, payload) => {
    const { ok } = await updateModule(id, payload);
    if (ok) {
      await fetchModules(currentPage.value);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteModule(id);
    if (ok) {
      await fetchModules(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getModule(id);
    return ok ? data : null;
  };

  return {
    systemmodules,
    loading,
    currentPage,
    perPage,
    search,
    fetchModules,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
