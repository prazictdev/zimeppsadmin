import { defineStore } from 'pinia';

export const useDocumentRequirementYearStore = defineStore('documentrequirementyear', () => {
  // ─── Years list (paginated) ──────────────────────────────────────────────
  const years = ref([]);
  const yearsLoading = ref(false);
  const yearsPagination = reactive({ currentPage: 1, lastPage: 1, perPage: 25, total: 0 });
  const yearsFilters = reactive({ search: '', status: '' });

  // ─── Currently focused year ──────────────────────────────────────────────
  const currentYear = ref(null);
  const yearLoading = ref(false);

  // ─── Items for the currently focused year ────────────────────────────────
  const items = ref([]);
  const itemsLoading = ref(false);
  const itemsPagination = reactive({ currentPage: 1, lastPage: 1, perPage: 50, total: 0 });
  const itemsFilters = reactive({ search: '' });

  // ─── Lookup data (loaded on demand) ──────────────────────────────────────
  const documents = ref([]);

  const helper = useDocumentRequirementYearHelper();
  const documentHelper = useDocumentHelper();
  const toast = useToast();

  const showError = (error, fallback) => {
    const msg = error?.value?.data?.message || error?.value?.message || fallback;
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
  };

  const showSuccess = (title, message) => {
    toast.success({ title, message, position: 'topRight', layout: 2 });
  };

  // ─── Lookups ─────────────────────────────────────────────────────────────
  // Only ENTITYREGISTRATION documents are eligible for yearly requirement entries.
  const ENTITY_REGISTRATION_TYPE = 'ENTITYREGISTRATION';

  const fetchLookups = async () => {
    if (documents.value.length === 0) {
      const { data, error } = await documentHelper.getDocuments();
      if (!error.value) {
        const all = data.value?.data ?? [];
        documents.value = all.filter((d) => d?.documenttype?.name === ENTITY_REGISTRATION_TYPE);
      }
    }
  };

  // ─── Years ───────────────────────────────────────────────────────────────
  const fetchYearsPage = async (page = yearsPagination.currentPage) => {
    yearsLoading.value = true;
    const { data, error } = await helper.getYears({
      page,
      perPage: yearsPagination.perPage,
      search: yearsFilters.search,
      status: yearsFilters.status,
    });

    if (!error.value) {
      const paginated = data.value?.data ?? {};
      years.value = paginated.data ?? [];
      yearsPagination.currentPage = paginated.current_page ?? 1;
      yearsPagination.lastPage = paginated.last_page ?? 1;
      yearsPagination.perPage = paginated.per_page ?? yearsPagination.perPage;
      yearsPagination.total = paginated.total ?? 0;
    } else {
      showError(error, 'Failed to fetch document requirement years.');
    }
    yearsLoading.value = false;
  };

  const setYearsSearch = async (value) => {
    yearsFilters.search = value ?? '';
    await fetchYearsPage(1);
  };

  const setYearsStatus = async (value) => {
    yearsFilters.status = value ?? '';
    await fetchYearsPage(1);
  };

  const fetchYear = async (id) => {
    yearLoading.value = true;
    const { data, error } = await helper.getYear(id);
    if (!error.value) {
      currentYear.value = data.value?.data ?? null;
    } else {
      showError(error, 'Failed to fetch year.');
    }
    yearLoading.value = false;
    return currentYear.value;
  };

  const createYear = async (payload) => {
    const { data: response, status, error } = await helper.createYear(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Year created', res.message);
      await fetchYearsPage(1);
      return res?.data ?? null;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to create year.');
    return null;
  };

  const updateYear = async (id, payload) => {
    const { data: response, status, error } = await helper.updateYear(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Year updated', res.message);
      await fetchYearsPage(yearsPagination.currentPage);
      if (currentYear.value?.id === id) await fetchYear(id);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update year.');
    return false;
  };

  const archiveYear = async (id) => {
    const { data: response, status, error } = await helper.archiveYear(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Year archived', res.message);
      await fetchYearsPage(yearsPagination.currentPage);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to archive year.');
    return false;
  };

  const activateYear = async (id) => {
    const { data: response, status, error } = await helper.activateYear(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Year activated', res.message);
      await fetchYearsPage(yearsPagination.currentPage);
      if (currentYear.value?.id === id) await fetchYear(id);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to activate year.');
    return false;
  };

  const cloneYear = async (id, payload) => {
    const { data: response, status, error } = await helper.cloneYear(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Year cloned', res.message);
      await fetchYearsPage(1);
      return res?.data ?? null;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to clone year.');
    return null;
  };

  // ─── Items ───────────────────────────────────────────────────────────────
  const fetchItemsPage = async (yearId, page = itemsPagination.currentPage) => {
    itemsLoading.value = true;
    const { data, error } = await helper.getItems({
      yearId,
      page,
      perPage: itemsPagination.perPage,
      search: itemsFilters.search,
    });

    if (!error.value) {
      const paginated = data.value?.data ?? {};
      items.value = paginated.data ?? [];
      itemsPagination.currentPage = paginated.current_page ?? 1;
      itemsPagination.lastPage = paginated.last_page ?? 1;
      itemsPagination.perPage = paginated.per_page ?? itemsPagination.perPage;
      itemsPagination.total = paginated.total ?? 0;
    } else {
      showError(error, 'Failed to fetch requirement items.');
    }
    itemsLoading.value = false;
  };

  const setItemsSearch = async (yearId, value) => {
    itemsFilters.search = value ?? '';
    await fetchItemsPage(yearId, 1);
  };

  const setItemsPerPage = async (yearId, value) => {
    itemsPagination.perPage = Math.max(10, Math.min(200, Number(value) || 50));
    await fetchItemsPage(yearId, 1);
  };

  const findItem = async (id) => {
    const { data, error } = await helper.getItem(id);
    if (!error.value) return data.value?.data ?? null;
    showError(error, 'Failed to fetch item.');
    return null;
  };

  const createItem = async (payload, yearId) => {
    const { data: response, status, error } = await helper.createItem(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Item added', res.message);
      if (yearId) await fetchItemsPage(yearId, 1);
      if (currentYear.value?.id === yearId) await fetchYear(yearId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to create item.');
    return false;
  };

  const updateItem = async (id, payload, yearId) => {
    const { data: response, status, error } = await helper.updateItem(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Item updated', res.message);
      if (yearId) await fetchItemsPage(yearId, itemsPagination.currentPage);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update item.');
    return false;
  };

  const deleteItem = async (id, yearId) => {
    const { data: response, status, error } = await helper.deleteItem(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Item deleted', res.message);
      if (yearId) await fetchItemsPage(yearId, itemsPagination.currentPage);
      if (currentYear.value?.id === yearId) await fetchYear(yearId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to delete item.');
    return false;
  };

  return {
    // years
    years,
    yearsLoading,
    yearsPagination,
    yearsFilters,
    fetchYearsPage,
    setYearsSearch,
    setYearsStatus,
    currentYear,
    yearLoading,
    fetchYear,
    createYear,
    updateYear,
    archiveYear,
    activateYear,
    cloneYear,
    // lookups
    documents,
    fetchLookups,
    // items
    items,
    itemsLoading,
    itemsPagination,
    itemsFilters,
    fetchItemsPage,
    setItemsSearch,
    setItemsPerPage,
    findItem,
    createItem,
    updateItem,
    deleteItem,
  };
});
