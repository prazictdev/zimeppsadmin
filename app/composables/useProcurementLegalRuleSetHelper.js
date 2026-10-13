export const useProcurementLegalRuleSetHelper = () => {
  const client = useSanctumClient();

  const request = async (url, options = {}, mutating = false) => {
    try {
      const data = await client(url, options);
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(!mutating), error: ref(err) };
    }
  };

  const getRuleSets = () => request('/api/v1/procurement-legal-rule-sets', { method: 'GET' });
  const getRuleSet = uuid => request(`/api/v1/procurement-legal-rule-sets/${uuid}`, { method: 'GET' });
  const createRuleSet = payload => request('/api/v1/procurement-legal-rule-sets', { method: 'POST', body: payload }, true);
  const updateRuleSet = (uuid, payload) => request(`/api/v1/procurement-legal-rule-sets/${uuid}`, { method: 'PUT', body: payload }, true);
  const deleteRuleSet = uuid => request(`/api/v1/procurement-legal-rule-sets/${uuid}`, { method: 'DELETE' }, true);
  const activateRuleSet = uuid => request(`/api/v1/procurement-legal-rule-sets/${uuid}/activate`, { method: 'POST' }, true);
  const createMethodRule = (uuid, payload) => request(`/api/v1/procurement-legal-rule-sets/${uuid}/method-rules`, { method: 'POST', body: payload }, true);
  const updateMethodRule = (uuid, ruleId, payload) => request(`/api/v1/procurement-legal-rule-sets/${uuid}/method-rules/${ruleId}`, { method: 'PUT', body: payload }, true);
  const deleteMethodRule = (uuid, ruleId) => request(`/api/v1/procurement-legal-rule-sets/${uuid}/method-rules/${ruleId}`, { method: 'DELETE' }, true);

  return {
    getRuleSets,
    getRuleSet,
    createRuleSet,
    updateRuleSet,
    deleteRuleSet,
    activateRuleSet,
    createMethodRule,
    updateMethodRule,
    deleteMethodRule,
  };
};
