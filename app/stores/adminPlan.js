import { defineStore } from 'pinia';

export const useAdminPlanStore = defineStore('adminPlan', () => {
  const plan = ref(null);
  const items = ref([]);
  const itemsMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });

  // Items split into consolidated groups (rows sharing a reference_no) and
  // standalone individual rows. Only the individual list is paginated.
  const consolidated = ref([]);
  const individual = ref([]);
  const individualMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const groupedLoading = ref(false);
  const totals = ref([]);
  const totalsByGroup = ref([]);
  const totalsByAwardType = ref([]);
  const totalsBySpoc = ref([]);
  const totalsByFlag = ref([]);
  const workflowActions = ref([]);
  const isCreator = ref(false);
  const transitions = ref([]);
  const recommendations = ref([]);
  const transitionError = ref('');
  const transitionReport = ref(null);
  const analysisReport = ref(null);

  // AI RAG compliance review (async; polled until COMPLETED/FAILED).
  const complianceReport = ref(null);
  const complianceStatus = ref(null);
  const complianceLoading = ref(false);
  const complianceLawReady = ref(true);
  const complianceError = ref(null);
  let compliancePollTimer = null;

  // Chat with the RAG compliance assistant about the plan.
  const chatMessages = ref([]);
  const chatLoading = ref(false);
  const chatSending = ref(false);

  const disposalPlans = ref([]);
  const disposalPlansMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const evaluationMembers = ref([]);
  const evaluationMembersMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const pmuMembers = ref([]);
  const pmuMembersMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const disposalMembers = ref([]);
  const disposalMembersMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const planDocuments = ref([]);
  const invoice = ref(null);

  const supplements = ref([]);
  const supplementsMeta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const currentSupplement = ref(null);
  const supplementWorkflowActions = ref([]);
  const supplementIsCreator = ref(false);

  const loading = ref(false);
  const itemsLoading = ref(false);
  const analysisLoading = ref(false);
  const subResourceLoading = ref(false);

  const helper = useAdminPlanHelper();
  const toast = useToast();

  const loadAll = async (uuid) => {
    loading.value = true;
    const [planR, totalsR, totalsGroupR, totalsAwardR, totalsSpocR, totalsFlagR, wfR, trR, recR, invR] = await Promise.all([
      helper.fetchPlan(uuid),
      helper.fetchTotals(uuid),
      helper.fetchTotalsByGroup(uuid),
      helper.fetchTotalsByAwardType(uuid),
      helper.fetchTotalsBySpoc(uuid),
      helper.fetchTotalsByFlag(uuid),
      helper.fetchWorkflowActions(uuid),
      helper.fetchTransitions(uuid),
      helper.fetchRecommendations(uuid),
      helper.fetchInvoice(uuid),
    ]);
    if (planR.ok) plan.value = planR.data?.data ?? null;
    if (totalsR.ok) totals.value = totalsR.data?.data ?? [];
    if (totalsGroupR.ok) totalsByGroup.value = totalsGroupR.data?.data ?? [];
    if (totalsAwardR.ok) totalsByAwardType.value = totalsAwardR.data?.data ?? [];
    if (totalsSpocR.ok) totalsBySpoc.value = totalsSpocR.data?.data ?? [];
    if (totalsFlagR.ok) totalsByFlag.value = totalsFlagR.data?.data ?? [];
    if (wfR.ok) {
      workflowActions.value = wfR.data?.data?.actions ?? [];
      isCreator.value = wfR.data?.data?.is_creator ?? false;
    }
    if (trR.ok) transitions.value = trR.data?.data ?? [];
    if (recR.ok) recommendations.value = recR.data?.data ?? [];
    if (invR.ok) invoice.value = invR.data?.data ?? null;
    loading.value = false;
  };

  // Map (search, filters) → the query-param shape every items-and-totals
  // endpoint expects. Shared between loadItems and loadTotals so the items
  // table and the summary cards stay in lockstep.
  const itemFilterParams = (search, filters = {}) => {
    const params = {};
    if (search) params.search = search;
    const flagKeys = [
      'pre_qualification', 'eoi', 'spoc',
      'sustainable_procurement', 'affirmative_procurement', 'procurement_exemption',
    ];
    for (const k of flagKeys) if (filters[k]) params[k] = 1;
    return params;
  };

  const loadItems = async (uuid, page = 1, search = '', filters = {}) => {
    itemsLoading.value = true;
    const params = {
      page,
      per_page: itemsMeta.value.per_page,
      ...itemFilterParams(search, filters),
    };

    const { ok, data } = await helper.fetchItems(uuid, params);
    if (ok) {
      const payload = data?.data ?? {};
      items.value = payload.data ?? [];
      itemsMeta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? itemsMeta.value.per_page,
      };
    }
    itemsLoading.value = false;
  };

  const loadGroupedItems = async (uuid, page = 1, search = '', filters = {}) => {
    groupedLoading.value = true;
    const params = {
      page,
      per_page: individualMeta.value.per_page,
      ...itemFilterParams(search, filters),
    };

    const { ok, data } = await helper.fetchGroupedItems(uuid, params);
    if (ok) {
      const payload = data?.data ?? {};
      consolidated.value = payload.consolidated ?? [];
      const ind = payload.individual ?? {};
      individual.value = ind.data ?? [];
      individualMeta.value = {
        current_page: ind.current_page ?? 1,
        last_page: ind.last_page ?? 1,
        total: ind.total ?? 0,
        per_page: ind.per_page ?? individualMeta.value.per_page,
      };
    }
    groupedLoading.value = false;
  };

  /**
   * Re-pull the summary totals using the same filter set the items
   * list is currently showing. Called whenever filters or search change so
   * the cards never drift out of sync with the visible rows.
   */
  const loadFilteredTotals = async (uuid, search = '', filters = {}) => {
    const params = itemFilterParams(search, filters);
    const [tR, tgR, taR, tsR, tfR] = await Promise.all([
      helper.fetchTotals(uuid, params),
      helper.fetchTotalsByGroup(uuid, params),
      helper.fetchTotalsByAwardType(uuid, params),
      helper.fetchTotalsBySpoc(uuid, params),
      helper.fetchTotalsByFlag(uuid, params),
    ]);
    if (tR.ok) totals.value = tR.data?.data ?? [];
    if (tgR.ok) totalsByGroup.value = tgR.data?.data ?? [];
    if (taR.ok) totalsByAwardType.value = taR.data?.data ?? [];
    if (tsR.ok) totalsBySpoc.value = tsR.data?.data ?? [];
    if (tfR.ok) totalsByFlag.value = tfR.data?.data ?? [];
  };

  const loadDisposalPlans = async (uuid, page = 1) => {
    subResourceLoading.value = true;
    const { ok, data } = await helper.fetchDisposalPlans(uuid, { page, per_page: disposalPlansMeta.value.per_page });
    if (ok) {
      const payload = data?.data ?? {};
      disposalPlans.value = payload.data ?? [];
      disposalPlansMeta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? disposalPlansMeta.value.per_page,
      };
    }
    subResourceLoading.value = false;
  };

  const loadEvaluationMembers = async (uuid, page = 1) => {
    subResourceLoading.value = true;
    const { ok, data } = await helper.fetchEvaluationCommittee(uuid, { page, per_page: evaluationMembersMeta.value.per_page });
    if (ok) {
      const payload = data?.data ?? {};
      evaluationMembers.value = payload.data ?? [];
      evaluationMembersMeta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? evaluationMembersMeta.value.per_page,
      };
    }
    subResourceLoading.value = false;
  };

  const loadPmuMembers = async (uuid, page = 1) => {
    subResourceLoading.value = true;
    const { ok, data } = await helper.fetchProcurementManagementUnit(uuid, { page, per_page: pmuMembersMeta.value.per_page });
    if (ok) {
      const payload = data?.data ?? {};
      pmuMembers.value = payload.data ?? [];
      pmuMembersMeta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? pmuMembersMeta.value.per_page,
      };
    }
    subResourceLoading.value = false;
  };

  const loadDisposalMembers = async (uuid, page = 1) => {
    subResourceLoading.value = true;
    const { ok, data } = await helper.fetchDisposalCommittee(uuid, { page, per_page: disposalMembersMeta.value.per_page });
    if (ok) {
      const payload = data?.data ?? {};
      disposalMembers.value = payload.data ?? [];
      disposalMembersMeta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? disposalMembersMeta.value.per_page,
      };
    }
    subResourceLoading.value = false;
  };

  const loadPlanDocuments = async (uuid) => {
    subResourceLoading.value = true;
    const { ok, data } = await helper.fetchPlanDocuments(uuid);
    if (ok) planDocuments.value = data?.data ?? [];
    subResourceLoading.value = false;
  };

  const runAnalysis = async (uuid) => {
    analysisLoading.value = true;
    const { ok, data } = await helper.analyzePlan(uuid);
    if (ok) analysisReport.value = data?.data ?? null;
    analysisLoading.value = false;
    return analysisReport.value;
  };

  // ─── AI compliance review (async; polled) ─────────────────────────────────
  const fetchComplianceAnalysis = async (uuid) => {
    const { ok, data } = await helper.fetchComplianceAnalysis(uuid);
    if (!ok) return null;
    const payload = data?.data ?? {};
    complianceReport.value = payload.report ?? null;
    complianceStatus.value = payload.analysis_status ?? null;
    complianceLawReady.value = payload.law_kb_ready ?? false;
    complianceError.value = payload.analysis_error ?? null;
    return payload;
  };

  const stopCompliancePoll = () => {
    if (compliancePollTimer) {
      clearTimeout(compliancePollTimer);
      compliancePollTimer = null;
    }
  };

  const pollCompliance = (uuid) => {
    stopCompliancePoll();
    compliancePollTimer = setTimeout(async () => {
      const payload = await fetchComplianceAnalysis(uuid);
      if (payload?.analysis_status === 'PENDING') {
        pollCompliance(uuid);
      } else {
        complianceLoading.value = false;
      }
    }, 2500);
  };

  const runComplianceAnalysis = async (uuid) => {
    complianceLoading.value = true;
    complianceReport.value = null;
    complianceError.value = null;
    const { ok, data } = await helper.startComplianceAnalysis(uuid, { include_rag: true, async: true });
    const res = data?.data;
    if (ok) {
      complianceStatus.value = res?.analysis_status ?? 'PENDING';
      if (res?.analysis_status === 'PENDING') {
        pollCompliance(uuid);
      } else {
        complianceReport.value = res?.report ?? null;
        complianceLoading.value = false;
      }
      return true;
    }
    complianceLoading.value = false;
    return false;
  };

  const fetchComplianceChat = async (uuid) => {
    chatLoading.value = true;
    const { ok, data } = await helper.fetchComplianceChat(uuid);
    if (ok) {
      const payload = data?.data ?? {};
      chatMessages.value = payload.messages ?? [];
      complianceLawReady.value = payload.law_kb_ready ?? complianceLawReady.value;
    }
    chatLoading.value = false;
  };

  const sendComplianceChatMessage = async (uuid, message) => {
    const text = (message ?? '').trim();
    if (!text || chatSending.value) return false;
    const optimistic = { id: `tmp-${Date.now()}`, role: 'user', content: text };
    chatMessages.value = [...chatMessages.value, optimistic];
    chatSending.value = true;
    const { ok, data } = await helper.sendComplianceChat(uuid, text);
    chatSending.value = false;
    if (ok) {
      const reply = data?.data?.message;
      if (reply) chatMessages.value = [...chatMessages.value, reply];
      return true;
    }
    chatMessages.value = chatMessages.value.filter((m) => m.id !== optimistic.id);
    return false;
  };

  const loadSupplements = async (uuid, page = 1, status = '') => {
    subResourceLoading.value = true;
    const { ok, data } = await helper.fetchSupplements(uuid, { page, per_page: supplementsMeta.value.per_page, status: status || undefined });
    if (ok) {
      const payload = data?.data ?? {};
      supplements.value = payload.data ?? [];
      supplementsMeta.value = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? supplementsMeta.value.per_page,
      };
    }
    subResourceLoading.value = false;
  };

  const loadSupplement = async (uuid, supplementUuid) => {
    const { ok, data } = await helper.fetchSupplement(uuid, supplementUuid);
    if (ok) currentSupplement.value = data?.data ?? null;
    const { ok: actOk, data: actData } = await helper.fetchSupplementWorkflowActions(uuid, supplementUuid);
    if (actOk && actData?.data) {
      supplementWorkflowActions.value = actData.data.actions ?? [];
      supplementIsCreator.value = !!actData.data.is_creator;
    }
    return currentSupplement.value;
  };

  const runSupplementTransition = async (uuid, supplementUuid, action, comment = null, extra = {}) => {
    const { ok, data, error } = await helper.supplementTransition(uuid, supplementUuid, { action, comment, ...extra });
    const res = data;
    if (ok && res?.status === true) {
      toast.success({ title: 'Done', message: res.message, position: 'topRight', layout: 2 });
      await Promise.all([loadSupplement(uuid, supplementUuid), loadSupplements(uuid)]);
      return true;
    }
    toast.error({
      title: 'Failed',
      message: error?.data?.message || res?.message || 'Failed to perform action.',
      position: 'topRight',
      layout: 2,
    });
    return false;
  };

  const runTransition = async (uuid, action, comment = null, extra = {}) => {
    transitionError.value = '';
    transitionReport.value = null;
    const { ok, data, error } = await helper.transition(uuid, { action, comment, ...extra });
    const res = data;
    if (ok && res?.status === true) {
      toast.success({ title: 'Done', message: res.message, position: 'topRight', layout: 2 });
      await loadAll(uuid);
      return true;
    }
    transitionError.value = error?.data?.message || res?.message || 'Failed to perform action.';
    transitionReport.value = error?.data?.data || res?.data || null;
    return false;
  };

  // AI-drafted send-back comment from the recommendation chain + AI findings.
  const draftWorkflowComment = async (uuid, action) => {
    const { ok, data, error } = await helper.draftWorkflowComment(uuid, action);
    if (ok && data?.status === true) {
      return data.data?.draft ?? '';
    }
    toast.error({
      title: 'Failed',
      message: error?.data?.message || data?.message || 'Could not draft a comment.',
      position: 'topRight',
      layout: 2,
    });
    return '';
  };

  return {
    plan, items, itemsMeta,
    consolidated, individual, individualMeta, groupedLoading,
    totals, totalsByGroup, totalsByAwardType, totalsBySpoc, totalsByFlag,
    disposalPlans, disposalPlansMeta,
    evaluationMembers, evaluationMembersMeta,
    pmuMembers, pmuMembersMeta,
    disposalMembers, disposalMembersMeta,
    planDocuments,
    invoice,
    supplements,
    supplementsMeta,
    currentSupplement,
    supplementWorkflowActions,
    supplementIsCreator,
    workflowActions, isCreator,
    transitions, recommendations, transitionError, transitionReport,
    analysisReport, analysisLoading,
    complianceReport, complianceStatus, complianceLoading, complianceLawReady, complianceError,
    chatMessages, chatLoading, chatSending,
    loading, itemsLoading, subResourceLoading,
    loadAll, loadItems, loadGroupedItems, loadFilteredTotals, runAnalysis, runTransition, draftWorkflowComment,
    fetchComplianceAnalysis, runComplianceAnalysis, fetchComplianceChat, sendComplianceChatMessage,
    loadDisposalPlans, loadEvaluationMembers, loadPmuMembers, loadDisposalMembers, loadPlanDocuments,
    loadSupplements, loadSupplement, runSupplementTransition,
  };
});
