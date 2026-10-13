export const useEvaluationcriterionHelper = () => {
  const client = useSanctumClient();

  const getEvaluationcriteria = async () => {
    try {
      const data = await client('/api/v1/evaluation-criteria/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getEvaluationcriterion = async (id) => {
    try {
      const data = await client(`/api/v1/evaluation-criteria/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createEvaluationcriterion = async (payload) => {
    try {
      const data = await client('/api/v1/evaluation-criteria', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateEvaluationcriterion = async (id, payload) => {
    try {
      const data = await client(`/api/v1/evaluation-criteria/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteEvaluationcriterion = async (id) => {
    try {
      const data = await client(`/api/v1/evaluation-criteria/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getEvaluationcriteria,
    getEvaluationcriterion,
    createEvaluationcriterion,
    updateEvaluationcriterion,
    deleteEvaluationcriterion,
  };
};
