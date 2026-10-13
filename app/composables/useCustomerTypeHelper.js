export const useCustomerTypeHelper = () => {
  const client = useSanctumClient();

  const getCustomerTypes = async () => {
    try {
      const data = await client('/api/v1/customer-types', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getCustomerType = async (id) => {
    try {
      const data = await client(`/api/v1/customer-types/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createCustomerType = async (payload) => {
    try {
      const data = await client('/api/v1/customer-types', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateCustomerType = async (id, payload) => {
    try {
      const data = await client(`/api/v1/customer-types/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteCustomerType = async (id) => {
    try {
      const data = await client(`/api/v1/customer-types/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getCustomerTypes, getCustomerType, createCustomerType, updateCustomerType, deleteCustomerType };
};
