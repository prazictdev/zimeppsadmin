import { defineStore } from 'pinia';

export const useCompanyCategoryStore = defineStore('companycategory', () => {
  const categories = ref(null);
  const allCategories = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getCompanyCategories,
    getCompanyCategory,
    createCompanyCategory,
    updateCompanyCategory,
    deleteCompanyCategory,
  } = useCompanyCategoryHelper();
  const toast = useToast();

  const fetchCategories = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getCompanyCategories(search.value, page, perPage.value);
    if (ok) {
      categories.value = data;
    }
    loading.value = false;
  };

  const fetchAllCategories = async () => {
    const { ok, data } = await getCompanyCategories('', 1, 1000);
    if (ok) {
      allCategories.value = data?.data ?? [];
    }
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createCompanyCategory(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Category created', message: data.message ?? 'Category created successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Category creation failed', message: data.message ?? 'Category creation failed', position: 'topRight', layout: 2 });
        }
        await fetchCategories(1);
      } else {
        toast.error({ title: 'Category creation failed', message: error ?? 'Category creation failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { ok, data, error } = await updateCompanyCategory(id, payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Category updated', message: data.message ?? 'Category updated successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Category update failed', message: data.message ?? 'Category update failed', position: 'topRight', layout: 2 });
        }
        await fetchCategories(currentPage.value);
      } else {
        toast.error({ title: 'Category update failed', message: error ?? 'Category update failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteCompanyCategory(id);
    if (ok) {
      await fetchCategories(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getCompanyCategory(id);
    return ok ? data : null;
  };

  return {
    categories,
    allCategories,
    loading,
    currentPage,
    perPage,
    search,
    fetchCategories,
    fetchAllCategories,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
