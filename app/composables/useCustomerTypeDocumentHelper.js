export const useCustomerTypeDocumentHelper = () => {
  const client = useSanctumClient();

  const getCustomerTypeDocuments = async () => {
    try {
      const data = await client('/api/v1/customer-type-documents', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getCustomerTypeDocument = async (id) => {
    try {
      const data = await client(`/api/v1/customer-type-documents/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createCustomerTypeDocument = async (payload) => {
    try {
      const data = await client('/api/v1/customer-type-documents', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateCustomerTypeDocument = async (id, payload) => {
    try {
      const data = await client(`/api/v1/customer-type-documents/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteCustomerTypeDocument = async (id) => {
    try {
      const data = await client(`/api/v1/customer-type-documents/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getCustomerTypeDocuments,
    getCustomerTypeDocument,
    createCustomerTypeDocument,
    updateCustomerTypeDocument,
    deleteCustomerTypeDocument,
  };
};
