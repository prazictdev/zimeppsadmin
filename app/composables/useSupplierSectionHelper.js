export const useSupplierSectionHelper = () => {
  const client = useSanctumClient();

  const getSupplierSections = async () => {
    try {
      const data = await client('/api/v1/supplier-sections', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSupplierSection = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-sections/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSupplierSection = async (payload) => {
    try {
      const data = await client('/api/v1/supplier-sections', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSupplierSection = async (id, payload) => {
    try {
      const data = await client(`/api/v1/supplier-sections/${id}`, {
        method: 'PUT',
        body: payload,
      });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSupplierSection = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-sections/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getSupplierSections,
    getSupplierSection,
    createSupplierSection,
    updateSupplierSection,
    deleteSupplierSection,
  };
};
