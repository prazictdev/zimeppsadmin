export const useCustomerTypeSupplierCategoryHelper = () => {
  const client = useSanctumClient();

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback;

  const getAll = async () => {
    try {
      const data = await client('/api/v1/customer-type-supplier-categories', { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load customer type supplier categories.') };
    }
  };

  const getOne = async (id) => {
    try {
      const data = await client(`/api/v1/customer-type-supplier-categories/${id}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load customer type supplier category.') };
    }
  };

  const create = async (payload) => {
    try {
      const data = await client('/api/v1/customer-type-supplier-categories', { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to create customer type supplier category.') };
    }
  };

  const update = async (id, payload) => {
    try {
      const data = await client(`/api/v1/customer-type-supplier-categories/${id}`, { method: 'PUT', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to update customer type supplier category.') };
    }
  };

  const remove = async (id) => {
    try {
      const data = await client(`/api/v1/customer-type-supplier-categories/${id}`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to remove customer type supplier category.') };
    }
  };

  return { getAll, getOne, create, update, remove };
};
