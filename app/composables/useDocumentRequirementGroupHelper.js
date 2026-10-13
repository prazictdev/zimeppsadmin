export const useDocumentRequirementGroupHelper = () => {
  const client = useSanctumClient();

  const getDocumentRequirementGroups = async () => {
    try {
      const data = await client('/api/v1/document-requirement-groups', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getDocumentRequirementGroup = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-groups/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createDocumentRequirementGroup = async (payload) => {
    try {
      const data = await client('/api/v1/document-requirement-groups', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateDocumentRequirementGroup = async (id, payload) => {
    try {
      const data = await client(`/api/v1/document-requirement-groups/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteDocumentRequirementGroup = async (id) => {
    try {
      const data = await client(`/api/v1/document-requirement-groups/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getDocumentRequirementGroups,
    getDocumentRequirementGroup,
    createDocumentRequirementGroup,
    updateDocumentRequirementGroup,
    deleteDocumentRequirementGroup,
  };
};
