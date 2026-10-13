import { defineStore } from 'pinia';

export const useCompanySubcategoryStore = defineStore('companysubcategory', () => {
  const subcategories = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');
  const filterCategoryId = ref('');

  const {
    getCompanySubcategories,
    getCompanySubcategory,
    createCompanySubcategory,
    updateCompanySubcategory,
    deleteCompanySubcategory,
  } = useCompanySubcategoryHelper();
  const toast = useToast();

  const fetchSubcategories = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getCompanySubcategories(search.value, page, perPage.value, filterCategoryId.value);
    if (ok) {
      subcategories.value = data;
    }
    loading.value = false;
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const setFilterCategory = (id) => {
    filterCategoryId.value = id;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createCompanySubcategory(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Subcategory created', message: data.message ?? 'Subcategory created successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Subcategory creation failed', message: data.message ?? 'Subcategory creation failed', position: 'topRight', layout: 2 });
        }
        await fetchSubcategories(1);
      } else {
        toast.error({ title: 'Subcategory creation failed', message: error ?? 'Subcategory creation failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { ok, data, error } = await updateCompanySubcategory(id, payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Subcategory updated', message: data.message ?? 'Subcategory updated successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Subcategory update failed', message: data.message ?? 'Subcategory update failed', position: 'topRight', layout: 2 });
        }
        await fetchSubcategories(currentPage.value);
      } else {
        toast.error({ title: 'Subcategory update failed', message: error ?? 'Subcategory update failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteCompanySubcategory(id);
    if (ok) {
      await fetchSubcategories(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getCompanySubcategory(id);
    return ok ? data : null;
  };

  return {
    subcategories,
    loading,
    currentPage,
    perPage,
    search,
    filterCategoryId,
    fetchSubcategories,
    setSearch,
    setFilterCategory,
    create,
    update,
    remove,
    findOne,
  };
});
