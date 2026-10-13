export const useUnitOfMeasureHelper = () => {
  const client = useSanctumClient();

  const getUnitOfMeasures = async () => {
    try {
      const data = await client('/api/v1/unit-of-measures/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getUnitOfMeasure = async (id) => {
    try {
      const data = await client(`/api/v1/unit-of-measures/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createUnitOfMeasure = async (payload) => {
    try {
      const data = await client('/api/v1/unit-of-measures', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateUnitOfMeasure = async (id, payload) => {
    try {
      const data = await client(`/api/v1/unit-of-measures/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const archiveUnitOfMeasure = async (id) => {
    try {
      const data = await client(`/api/v1/unit-of-measures/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getUnitOfMeasures,
    getUnitOfMeasure,
    createUnitOfMeasure,
    updateUnitOfMeasure,
    archiveUnitOfMeasure,
  };
};
