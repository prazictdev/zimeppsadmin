export const useTrainingSessionHelper = () => {
  const client = useSanctumClient();
  const baseUrl = '/api/v1/training-sessions';

  const getTrainingSessions = async () => {
    try {
      const data = await client(baseUrl, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (error) {
      return { data: ref(null), error: ref(error) };
    }
  };

  const getTrainingSession = async (uuid) => {
    try {
      const data = await client(`${baseUrl}/${uuid}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (error) {
      return { data: ref(null), error: ref(error) };
    }
  };

  const createTrainingSession = async (payload) => {
    try {
      const data = await client(baseUrl, { method: 'POST', body: payload });
      return { data: ref(data), error: ref(null) };
    } catch (error) {
      return { data: ref(null), error: ref(error) };
    }
  };

  const deactivateTrainingSession = async (uuid) => {
    try {
      const data = await client(`${baseUrl}/${uuid}`, { method: 'DELETE' });
      return { data: ref(data), error: ref(null) };
    } catch (error) {
      return { data: ref(null), error: ref(error) };
    }
  };

  return { getTrainingSessions, getTrainingSession, createTrainingSession, deactivateTrainingSession };
};
