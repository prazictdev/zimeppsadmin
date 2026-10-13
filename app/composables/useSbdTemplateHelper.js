export const useSbdTemplateHelper = () => {
  const client = useSanctumClient();

  const getSbdTemplates = async () => {
    try {
      const data = await client('/api/v1/sbd-templates', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSbdTemplate = async (id) => {
    try {
      const data = await client(`/api/v1/sbd-templates/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSbdTemplateDefaults = async () => {
    try {
      const data = await client('/api/v1/sbd-templates/defaults', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSbdTemplate = async (payload) => {
    try {
      const data = await client('/api/v1/sbd-templates', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSbdTemplate = async (id, payload) => {
    try {
      const data = await client(`/api/v1/sbd-templates/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSbdTemplate = async (id) => {
    try {
      const data = await client(`/api/v1/sbd-templates/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getSbdTemplates,
    getSbdTemplate,
    getSbdTemplateDefaults,
    createSbdTemplate,
    updateSbdTemplate,
    deleteSbdTemplate,
  };
};
