export const useDocumentHelper = () => {
  const client = useSanctumClient();

  const getDocuments = async () => {
    try {
      const data = await client('/api/v1/documents', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getDocument = async (id) => {
    try {
      const data = await client(`/api/v1/documents/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createDocument = async (payload) => {
    try {
      const data = await client('/api/v1/documents', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateDocument = async (id, payload) => {
    try {
      const data = await client(`/api/v1/documents/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteDocument = async (id) => {
    try {
      const data = await client(`/api/v1/documents/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getDocuments, getDocument, createDocument, updateDocument, deleteDocument };
};
