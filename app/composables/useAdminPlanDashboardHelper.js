export const useAdminPlanDashboardHelper = () => {
  const client = useSanctumClient();

  const fetch = async () => {
    try {
      const data = await client('/api/v1/admin-plan-dashboard', { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchCompanies = async (params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `/api/v1/admin-plan-dashboard/companies${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  return { fetch, fetchCompanies };
};
