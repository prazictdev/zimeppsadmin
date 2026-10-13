export const useSupplierGroupHelper = () => {
  const client = useSanctumClient();

  const getSupplierGroups = async () => {
    try {
      const data = await client('/api/v1/supplier-groups', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSupplierGroup = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-groups/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSupplierGroup = async (payload) => {
    try {
      const data = await client('/api/v1/supplier-groups', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSupplierGroup = async (id, payload) => {
    try {
      const data = await client(`/api/v1/supplier-groups/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSupplierGroup = async (id) => {
    try {
      const data = await client(`/api/v1/supplier-groups/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getSupplierGroups,
    getSupplierGroup,
    createSupplierGroup,
    updateSupplierGroup,
    deleteSupplierGroup,
  };
};
