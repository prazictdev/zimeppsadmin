import { defineStore } from 'pinia';

export const useCompanyIndustryStore = defineStore('companyindustry', () => {
  const industries = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getCompanyIndustries,
    getCompanyIndustry,
    createCompanyIndustry,
    updateCompanyIndustry,
    deleteCompanyIndustry,
  } = useCompanyIndustryHelper();
  const toast = useToast();

  const fetchIndustries = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getCompanyIndustries(search.value, page, perPage.value);
    if (ok) {
      industries.value = data;
    }
    loading.value = false;
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createCompanyIndustry(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Industry created', message: data.message ?? 'Industry created successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Industry creation failed', message: data.message ?? 'Industry creation failed', position: 'topRight', layout: 2 });
        }
        await fetchIndustries(1);
      } else {
        toast.error({ title: 'Industry creation failed', message: error ?? 'Industry creation failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { ok, data, error } = await updateCompanyIndustry(id, payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Industry updated', message: data.message ?? 'Industry updated successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Industry update failed', message: data.message ?? 'Industry update failed', position: 'topRight', layout: 2 });
        }
        await fetchIndustries(currentPage.value);
      } else {
        toast.error({ title: 'Industry update failed', message: error ?? 'Industry update failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteCompanyIndustry(id);
    if (ok) {
      await fetchIndustries(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getCompanyIndustry(id);
    return ok ? data : null;
  };

  return {
    industries,
    loading,
    currentPage,
    perPage,
    search,
    fetchIndustries,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
