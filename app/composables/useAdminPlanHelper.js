export const useAdminPlanHelper = () => {
  const client = useSanctumClient();
  const base = '/api/v1/annual-procurement-plans';

  const fetchPlan = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchItems = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/items${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  // ─── AI compliance review ───────────────────────────────────────────────
  const fetchComplianceAnalysis = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/compliance-analysis`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const startComplianceAnalysis = async (uuid, payload = {}) => {
    try {
      const data = await client(`${base}/${uuid}/compliance-analysis/run`, { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchComplianceChat = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/compliance-chat`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const sendComplianceChat = async (uuid, message) => {
    try {
      const data = await client(`${base}/${uuid}/compliance-chat`, { method: 'POST', body: { message } });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  // Items split into consolidated groups (rows sharing a reference_no) and
  // standalone individual rows. Same filter params as fetchItems.
  const fetchGroupedItems = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/items/grouped${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  // The three totals endpoints accept the same filter params as /items so
  // the summary cards mirror the filtered slice the user is looking at.
  const totalsQs = (params) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    }
    return qs.toString() ? `?${qs}` : '';
  };

  const fetchTotals = async (uuid, params = {}) => {
    try {
      const data = await client(`${base}/${uuid}/totals${totalsQs(params)}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchTotalsByGroup = async (uuid, params = {}) => {
    try {
      const data = await client(`${base}/${uuid}/totals/groups${totalsQs(params)}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchTotalsByAwardType = async (uuid, params = {}) => {
    try {
      const data = await client(`${base}/${uuid}/totals/awards${totalsQs(params)}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchTotalsBySpoc = async (uuid, params = {}) => {
    try {
      const data = await client(`${base}/${uuid}/totals/spoc${totalsQs(params)}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchTotalsByFlag = async (uuid, params = {}) => {
    try {
      const data = await client(`${base}/${uuid}/totals/flags${totalsQs(params)}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchWorkflowActions = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/workflow/actions`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchTransitions = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/transitions`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchSupplements = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/supplements${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchSupplement = async (uuid, supplementUuid) => {
    try {
      const data = await client(`${base}/${uuid}/supplements/${supplementUuid}`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchSupplementWorkflowActions = async (uuid, supplementUuid) => {
    try {
      const data = await client(`${base}/${uuid}/supplements/${supplementUuid}/workflow/actions`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchSupplementEligibleNextActors = async (uuid, supplementUuid, stage) => {
    try {
      const url = `${base}/${uuid}/supplements/${supplementUuid}/workflow/eligible-next-actors?stage=${encodeURIComponent(stage)}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const supplementTransition = async (uuid, supplementUuid, payload) => {
    try {
      const data = await client(`${base}/${uuid}/supplements/${supplementUuid}/transition`, { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchInvoice = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/invoice`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchEligibleNextActors = async (uuid, stage) => {
    try {
      const url = `${base}/${uuid}/workflow/eligible-next-actors?stage=${encodeURIComponent(stage)}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchRecommendations = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/recommendations`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchDisposalPlans = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/disposalplans${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchEvaluationCommittee = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/evaluation-committee${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchProcurementManagementUnit = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/procurement-management-unit${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchDisposalCommittee = async (uuid, params = {}) => {
    try {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v);
      }
      const url = `${base}/${uuid}/disposal-committee${qs.toString() ? `?${qs}` : ''}`;
      const data = await client(url, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const fetchPlanDocuments = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/documents`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const analyzePlan = async (uuid) => {
    try {
      const data = await client(`${base}/${uuid}/analyze`, { method: 'GET' });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const transition = async (uuid, payload) => {
    try {
      const data = await client(`${base}/${uuid}/transition`, { method: 'POST', body: payload });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  const draftWorkflowComment = async (uuid, action) => {
    try {
      const data = await client(`${base}/${uuid}/workflow/draft-comment`, { method: 'POST', body: { action } });
      return { ok: true, data, error: null };
    } catch (err) {
      return { ok: false, data: null, error: err };
    }
  };

  return {
    fetchPlan, fetchItems, fetchGroupedItems,
    fetchTotals, fetchTotalsByGroup, fetchTotalsByAwardType, fetchTotalsBySpoc, fetchTotalsByFlag,
    fetchDisposalPlans, fetchEvaluationCommittee, fetchProcurementManagementUnit, fetchDisposalCommittee, fetchPlanDocuments,
    fetchWorkflowActions, fetchEligibleNextActors, fetchTransitions, fetchRecommendations, fetchInvoice,
    fetchSupplements, fetchSupplement, fetchSupplementWorkflowActions, fetchSupplementEligibleNextActors, supplementTransition,
    analyzePlan, fetchComplianceAnalysis, startComplianceAnalysis, fetchComplianceChat, sendComplianceChat, transition,
    draftWorkflowComment,
  };
};
