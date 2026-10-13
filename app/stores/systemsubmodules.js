import { defineStore } from 'pinia';

export const useSystemsubmoduleStore = defineStore('systemsubmodule', () => {
  const systemsubmodules = ref(null);
  const systemmodule = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getSubModules,
    getSubModule,
    createSubModule,
    updateSubModule,
    deleteSubModule,
  } = useSubmoduleHelper();
  const toast = useToast();

  const fetchSubModules = async (moduleId) => {
    loading.value = true;
    const { ok, data } = await getSubModules(moduleId, search.value);
    if (ok) {
      systemsubmodules.value = data;
    }
    loading.value = false;
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createSubModule(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Submodule created', message: data.message });
          return true;
        }
        if (data?.status === 'error') {
          toast.error({ title: 'Submodule creation failed', message: data.message });
          return false;
        }
        return true;
      } else {
        toast.error({ title: 'Submodule creation failed', message: error ?? 'Error' });
        return false;
      }
    } catch (err) {
      toast.error({ title: 'Submodule creation failed', message: err?.message ?? 'Error' });
      return false;
    }
  };

  const update = async (id, payload) => {
    const { ok } = await updateSubModule(id, payload);
    return ok;
  };

  const remove = async (id) => {
    const { ok } = await deleteSubModule(id);
    return ok;
  };

  const findOne = async (id) => {
    const { ok, data } = await getSubModule(id);
    return ok ? data : null;
  };

  return {
    systemsubmodules,
    systemmodule,
    loading,
    currentPage,
    perPage,
    search,
    fetchSubModules,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
