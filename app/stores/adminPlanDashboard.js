import { defineStore } from 'pinia';

export const useAdminPlanDashboardStore = defineStore('adminPlanDashboard', () => {
  const kpi = ref({ total_pes: 0, pes_with_submissions: 0, pes_without_submissions: 0 });
  const tabCounts = ref({});
  const myQueue = ref({ handler: 0, manager: 0, approver: 0 });
  const summaryLoading = ref(false);

  const lanes = ref({});
  const filter = ref('PENDING_ADMIN_AUTHORIZATION');
  const search = ref('');

  const { fetch, fetchCompanies } = useAdminPlanDashboardHelper();

  const loadSummary = async () => {
    summaryLoading.value = true;
    const { ok, data } = await fetch();
    if (ok) {
      const payload = data?.data ?? {};
      kpi.value = payload.kpi ?? kpi.value;
      tabCounts.value = payload.tab_counts ?? {};
      myQueue.value = payload.my_queue ?? myQueue.value;
    }
    summaryLoading.value = false;
  };

  const emptyMeta = () => ({ current_page: 1, last_page: 1, total: 0, per_page: 25 });
  const emptyLane = () => ({ companies: [], meta: emptyMeta(), loading: false, loaded: false, error: null });

  const lane = (key) => lanes.value[key] ?? emptyLane();

  const loadLane = async (key, page = 1) => {
    if (!lanes.value[key]) lanes.value[key] = emptyLane();
    const target = lanes.value[key];
    target.loading = true;
    target.error = null;
    const { ok, data } = await fetchCompanies({
      page,
      per_page: target.meta.per_page,
      filter: key,
      search: search.value || undefined,
    });
    if (ok) {
      const payload = data?.data ?? {};
      target.companies = payload.data ?? [];
      target.meta = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? target.meta.per_page,
      };
      target.loaded = true;
    } else {
      target.error = 'Unable to load this workflow lane.';
    }
    target.loading = false;
  };

  const loadCompanies = async (page = 1) => loadLane(filter.value, page);
  const loadAllLanes = async (keys) => Promise.all(keys.map(key => loadLane(key, 1)));

  const setFilter = async (tab) => {
    filter.value = tab;
    if (!lane(tab).loaded && !lane(tab).loading) await loadLane(tab, 1);
  };

  const setSearch = async (term) => {
    search.value = term;
    const keys = Object.keys(lanes.value);
    lanes.value = {};
    await loadAllLanes(keys.length ? keys : [filter.value]);
  };

  const clearLanes = () => { lanes.value = {}; };

  return {
    kpi, tabCounts, myQueue, summaryLoading,
    lanes, filter, search,
    lane, loadSummary, loadLane, loadAllLanes, loadCompanies, setFilter, setSearch, clearLanes,
  };
});
