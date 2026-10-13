export const useSupplierCategoryHelper = () => {
  const client = useSanctumClient();

  const getSupplierCategories = async () => {
    try {
      const data = await client('/api/v1/supplier-categories', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSupplierCategory = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-categories/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSupplierCategory = async (payload) => {
    try {
      const data = await client('/api/v1/supplier-categories', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSupplierCategory = async (id, payload) => {
    try {
      const data = await client(`/api/v1/supplier-categories/${id}`, {
        method: 'PUT',
        body: payload,
      });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSupplierCategory = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-categories/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getSupplierCategories,
    getSupplierCategory,
    createSupplierCategory,
    updateSupplierCategory,
    deleteSupplierCategory,
  };
};
