export const useProcurementEntityHelper = () => {
  const client = useSanctumClient();
  const base = '/api/v1/procurement-entities';

  const list = async (params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const availableHandlers = async (search = '') => {
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await client(`${base}/available-handlers${qs}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const assign = async (companyId, userId) => {
    try {
      const data = await client(`${base}/${companyId}/assign`, {
        method: 'POST',
        body: { user_id: userId },
      });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const unassign = async (companyId) => {
    try {
      const data = await client(`${base}/${companyId}/assign`, { method: 'DELETE' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  return { list, availableHandlers, assign, unassign };
};
