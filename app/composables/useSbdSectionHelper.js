export const useSbdSectionHelper = () => {
  const client = useSanctumClient();

  const getSbdSections = async () => {
    try {
      const data = await client('/api/v1/sbd-sections', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createSbdSection = async (payload) => {
    try {
      const data = await client('/api/v1/sbd-sections', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateSbdSection = async (id, payload) => {
    try {
      const data = await client(`/api/v1/sbd-sections/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteSbdSection = async (id) => {
    try {
      const data = await client(`/api/v1/sbd-sections/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getSbdSections, createSbdSection, updateSbdSection, deleteSbdSection };
};
