import { defineStore } from 'pinia';

export const useCompanyStore = defineStore('company', () => {
  const companies = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');
  const hasSearched = ref(false);
  const filters = ref({
    country: '',
    companycategory_id: '',
    companysubcategory_id: '',
    province_id: '',
    district_id: '',
    accounttype_id: '',
  });

  const {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCompanyHelper();
  const toast = useToast();

  const fetchCompanies = async (page = 1) => {
    const hasCriteria = Boolean(search.value.trim()) || Object.values(filters.value).some(Boolean);
    if (!hasCriteria) {
      companies.value = null;
      hasSearched.value = false;
      return;
    }

    loading.value = true;
    hasSearched.value = true;
    currentPage.value = page;
    try {
      const { ok, data } = await getCompanies(search.value, page, perPage.value, filters.value);
      if (ok) {
        companies.value = data;
      }
    } finally {
      loading.value = false;
    }
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const setFilters = (value) => {
    filters.value = { ...filters.value, ...(value ?? {}) };
  };

  const clearSearch = () => {
    search.value = '';
    filters.value = {
      country: '',
      companycategory_id: '',
      companysubcategory_id: '',
      province_id: '',
      district_id: '',
      accounttype_id: '',
    };
    companies.value = null;
    currentPage.value = 1;
    hasSearched.value = false;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createCompany(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Customer created', message: 'Customer created successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Customer creation failed', message: data.message ?? 'Customer creation failed', position: 'topRight', layout: 2 });
        }
        await fetchCompanies(1);
      } else {
        toast.error({ title: 'Customer creation failed', message: error ?? 'Customer creation failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { ok, data, error } = await updateCompany(id, payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Customer updated', message: 'Customer updated successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Customer update failed', message: data.message ?? 'Customer update failed', position: 'topRight', layout: 2 });
        }
        await fetchCompanies(currentPage.value);
      } else {
        toast.error({ title: 'Customer update failed', message: error ?? 'Customer update failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
      toast.error({ title: 'Customer update failed', message: err?.message ?? 'Customer update failed', position: 'topRight', layout: 2 });
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteCompany(id);
    if (ok) {
      await fetchCompanies(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getCompany(id);
    return ok ? data : null;
  };

  return {
    companies,
    loading,
    currentPage,
    perPage,
    search,
    hasSearched,
    filters,
    fetchCompanies,
    setSearch,
    setFilters,
    clearSearch,
    create,
    update,
    remove,
    findOne,
  };
});
