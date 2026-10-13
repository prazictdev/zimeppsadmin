export const useProcurementGroupHelper = () => {
  const client = useSanctumClient();

  const getProcurementGroups = async () => {
    try {
      const data = await client('/api/v1/procurement-groups/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getProcurementGroup = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createProcurementGroup = async (payload) => {
    try {
      const data = await client('/api/v1/procurement-groups', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateProcurementGroup = async (id, payload) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteProcurementGroup = async (id) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const syncEvaluationCriteria = async (id, criterionIds) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${id}/evaluation-criteria`, {
        method: 'PUT',
        body: { criterion_ids: criterionIds },
      });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const syncBidopeningTypes = async (id, bidopeningtypeIds) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${id}/bid-opening-types`, {
        method: 'PUT',
        body: { bidopeningtype_ids: bidopeningtypeIds },
      });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const syncProcurementMethods = async (id, methodIds, defaultMethodId) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${id}/procurement-methods`, {
        method: 'PUT',
        body: { method_ids: methodIds, default_method_id: defaultMethodId },
      });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const getBidEvaluationMethods = async () => {
    try {
      const data = await client('/api/v1/bid-evaluation-methods/list', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getSelectionMethods = async (groupId, procurementMethodId) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${groupId}/procurement-methods/${procurementMethodId}/selection-methods`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const syncSelectionMethods = async (groupId, procurementMethodId, mappings) => {
    try {
      const data = await client(`/api/v1/procurement-groups/${groupId}/selection-methods`, {
        method: 'PUT',
        body: { procurementmethod_id: procurementMethodId, mappings },
      });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return {
    getProcurementGroups,
    getProcurementGroup,
    createProcurementGroup,
    updateProcurementGroup,
    deleteProcurementGroup,
    syncEvaluationCriteria,
    syncBidopeningTypes,
    syncProcurementMethods,
    getBidEvaluationMethods,
    getSelectionMethods,
    syncSelectionMethods,
  };
};
