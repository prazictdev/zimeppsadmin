export const useSystemSettingHelper = () => {
  const client = useSanctumClient();

  const getProcurementPlanSettings = async () => {
    return await client('/api/v1/system-settings/procurement-plan', { method: 'GET' });
  };

  const updateProcurementPlanSettings = async (payload) => {
    return await client('/api/v1/system-settings/procurement-plan', { method: 'PUT', body: payload });
  };

  const searchProcurementEntities = async (search = '', page = 1) => {
    const params = new URLSearchParams({ search, page: String(page), perPage: '20' });
    return await client(`/api/v1/system-settings/procurement-plan/entities?${params.toString()}`, { method: 'GET' });
  };

  return { getProcurementPlanSettings, updateProcurementPlanSettings, searchProcurementEntities };
};
