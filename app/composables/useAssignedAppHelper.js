export const useAssignedAppHelper = () => {
  const client = useSanctumClient();

  const fetchAssignedApps = async (params = {}) => {
    try {
      const data = await client('/api/v1/assigned-app', { method: 'GET', query: params });
      return { ok: true, data, error: null };
    } catch (error) {
      return { ok: false, data: null, error };
    }
  };

  return { fetchAssignedApps };
};
