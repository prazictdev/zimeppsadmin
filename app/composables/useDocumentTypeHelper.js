export const useDocumentTypeHelper = () => {
  const client = useSanctumClient();

  const getDocumentTypes = async () => {
    try {
      const data = await client('/api/v1/document-types', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getDocumentType = async (id) => {
    try {
      const data = await client(`/api/v1/document-types/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createDocumentType = async (payload) => {
    try {
      const data = await client('/api/v1/document-types', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateDocumentType = async (id, payload) => {
    try {
      const data = await client(`/api/v1/document-types/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteDocumentType = async (id) => {
    try {
      const data = await client(`/api/v1/document-types/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getDocumentTypes, getDocumentType, createDocumentType, updateDocumentType, deleteDocumentType };
};
