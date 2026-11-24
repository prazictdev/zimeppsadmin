import { defineStore } from 'pinia';

export const useTrainingSessionStore = defineStore('trainingSessions', () => {
  const sessions = ref([]);
  const loading = ref(false);
  const creating = ref(false);
  const toast = useToast();
  const { getTrainingSessions, getTrainingSession, createTrainingSession, deactivateTrainingSession } = useTrainingSessionHelper();

  const messageFrom = (error, fallback) =>
    error?.data?.message || error?.message || fallback;

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getTrainingSessions();
    if (!error.value) {
      const responseData = data.value?.data;
      sessions.value = Array.isArray(responseData) ? responseData : responseData?.data ?? [];
    } else {
      toast.error({
        title: 'Could not load training sessions',
        message: messageFrom(error.value, 'Please try again.'),
        position: 'topRight',
        layout: 2,
      });
    }
    loading.value = false;
  };

  const findOne = async (uuid) => {
    const { data, error } = await getTrainingSession(uuid);
    if (!error.value) return data.value?.data ?? null;
    toast.error({
      title: 'Could not load training session',
      message: messageFrom(error.value, 'Please try again.'),
      position: 'topRight',
      layout: 2,
    });
    return null;
  };

  const create = async (payload) => {
    creating.value = true;
    const { data, error } = await createTrainingSession(payload);
    creating.value = false;

    if (error.value) {
      toast.error({
        title: 'Training session was not generated',
        message: messageFrom(error.value, 'Please check the details and try again.'),
        position: 'topRight',
        layout: 2,
      });
      return null;
    }

    toast.success({
      title: 'Training session ready',
      message: data.value?.message || 'The test accounts have been generated.',
      position: 'topRight',
      layout: 2,
    });
    await fetchAll();
    return data.value?.data ?? null;
  };

  const deactivate = async (uuid) => {
    const { data, error } = await deactivateTrainingSession(uuid);
    if (error.value) {
      toast.error({
        title: 'Session was not deactivated',
        message: messageFrom(error.value, 'Please try again.'),
        position: 'topRight',
        layout: 2,
      });
      return false;
    }

    toast.success({
      title: 'Training session deactivated',
      message: data.value?.message || 'The generated users can no longer sign in.',
      position: 'topRight',
      layout: 2,
    });
    await fetchAll();
    return true;
  };

  return { sessions, loading, creating, fetchAll, findOne, create, deactivate };
});
