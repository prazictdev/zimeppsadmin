import { defineStore } from 'pinia';

export const useSupplierCategoryStore = defineStore('suppliercategory', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getSupplierCategories,
    getSupplierCategory,
    createSupplierCategory,
    updateSupplierCategory,
    deleteSupplierCategory,
  } = useSupplierCategoryHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getSupplierCategories();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch categories.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getSupplierCategory(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch category.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createSupplierCategory(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Category created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create category';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateSupplierCategory(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Category updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update category';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteSupplierCategory(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Category deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete category';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { items, loading, fetchAll, findOne, create, update, remove };
});
