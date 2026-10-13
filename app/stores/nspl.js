import { defineStore } from 'pinia';

export const useNsplStore = defineStore('nspl', () => {
  // ─── Editions list (paginated) ───────────────────────────────────────────
  const editions = ref([]);
  const editionsLoading = ref(false);
  const editionsPagination = reactive({ currentPage: 1, lastPage: 1, perPage: 25, total: 0 });
  const editionsFilters = reactive({ search: '', status: '' });

  // ─── Currently focused edition + its full products listing ──────────────
  const currentEdition = ref(null);
  const editionLoading = ref(false);

  const products = ref([]);
  const productsLoading = ref(false);
  const productsPagination = reactive({ currentPage: 1, lastPage: 1, perPage: 50, total: 0 });
  const productsFilters = reactive({ search: '', divisionId: null, sectionId: null, priced: '' });

  // ─── Lookups ────────────────────────────────────────────────────────────
  const categories = ref([]);
  const divisions = ref([]);
  const sections = ref([]);

  const helper = useNsplHelper();
  const toast = useToast();

  const showError = (error, fallback) => {
    const msg = error?.value?.data?.message || error?.value?.message || fallback;
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
  };

  const showSuccess = (title, message) => {
    toast.success({ title, message, position: 'topRight', layout: 2 });
  };

  // ─── Categories ─────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    if (categories.value.length) return;
    const { data, error } = await helper.getCategories();
    if (!error.value) {
      categories.value = data.value?.data ?? [];
    } else {
      showError(error, 'Failed to fetch NSPL categories.');
    }
  };

  // ─── Editions ───────────────────────────────────────────────────────────
  const fetchEditionsPage = async (page = editionsPagination.currentPage) => {
    editionsLoading.value = true;
    const { data, error } = await helper.getEditions({
      page,
      perPage: editionsPagination.perPage,
      search: editionsFilters.search,
      status: editionsFilters.status,
    });

    if (!error.value) {
      const paginated = data.value?.data ?? {};
      editions.value = paginated.data ?? [];
      editionsPagination.currentPage = paginated.current_page ?? 1;
      editionsPagination.lastPage = paginated.last_page ?? 1;
      editionsPagination.perPage = paginated.per_page ?? editionsPagination.perPage;
      editionsPagination.total = paginated.total ?? 0;
    } else {
      showError(error, 'Failed to fetch NSPL editions.');
    }
    editionsLoading.value = false;
  };

  const setEditionsSearch = async (value) => {
    editionsFilters.search = value ?? '';
    await fetchEditionsPage(1);
  };

  const setEditionsStatus = async (value) => {
    editionsFilters.status = value ?? '';
    await fetchEditionsPage(1);
  };

  const fetchEdition = async (id) => {
    editionLoading.value = true;
    const { data, error } = await helper.getEdition(id);
    if (!error.value) {
      currentEdition.value = data.value?.data ?? null;
    } else {
      showError(error, 'Failed to fetch NSPL edition.');
    }
    editionLoading.value = false;
    return currentEdition.value;
  };

  const createEdition = async (payload) => {
    const { data: response, status, error } = await helper.createEdition(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Edition created', res.message);
      await fetchEditionsPage(1);
      return res?.data ?? null;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to create edition.');
    return null;
  };

  const updateEdition = async (id, payload) => {
    const { data: response, status, error } = await helper.updateEdition(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Edition updated', res.message);
      await fetchEditionsPage(editionsPagination.currentPage);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update edition.');
    return false;
  };

  const archiveEdition = async (id) => {
    const { data: response, status, error } = await helper.archiveEdition(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Edition archived', res.message);
      await fetchEditionsPage(editionsPagination.currentPage);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to archive edition.');
    return false;
  };

  const publishEdition = async (id) => {
    const { data: response, status, error } = await helper.publishEdition(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Edition published', res.message);
      await fetchEditionsPage(editionsPagination.currentPage);
      if (currentEdition.value?.id === id) await fetchEdition(id);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to publish edition.');
    return false;
  };

  const cloneEdition = async (id, payload) => {
    const { data: response, status, error } = await helper.cloneEdition(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Edition cloned', res.message);
      await fetchEditionsPage(1);
      return res?.data ?? null;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to clone edition.');
    return null;
  };

  // ─── Divisions ──────────────────────────────────────────────────────────
  const fetchDivisions = async (editionId) => {
    const { data, error } = await helper.getDivisionsByEdition(editionId);
    if (!error.value) {
      divisions.value = data.value?.data ?? [];
    } else {
      showError(error, 'Failed to fetch divisions.');
    }
    return divisions.value;
  };

  const createDivision = async (payload) => {
    const { data: response, status, error } = await helper.createDivision(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Division created', res.message);
      if (payload.edition_id) await fetchDivisions(payload.edition_id);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to create division.');
    return false;
  };

  const updateDivision = async (id, payload, editionId) => {
    const { data: response, status, error } = await helper.updateDivision(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Division updated', res.message);
      if (editionId) await fetchDivisions(editionId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update division.');
    return false;
  };

  const deleteDivision = async (id, editionId) => {
    const { data: response, status, error } = await helper.deleteDivision(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Division deleted', res.message);
      if (editionId) await fetchDivisions(editionId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to delete division.');
    return false;
  };

  // ─── Sections ───────────────────────────────────────────────────────────
  const fetchSections = async (divisionId) => {
    const { data, error } = await helper.getSectionsByDivision(divisionId);
    if (!error.value) {
      sections.value = data.value?.data ?? [];
    } else {
      showError(error, 'Failed to fetch sections.');
    }
    return sections.value;
  };

  const createSection = async (payload) => {
    const { data: response, status, error } = await helper.createSection(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Section created', res.message);
      if (payload.division_id) await fetchSections(payload.division_id);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to create section.');
    return false;
  };

  const updateSection = async (id, payload, divisionId) => {
    const { data: response, status, error } = await helper.updateSection(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Section updated', res.message);
      if (divisionId) await fetchSections(divisionId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update section.');
    return false;
  };

  const deleteSection = async (id, divisionId) => {
    const { data: response, status, error } = await helper.deleteSection(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Section deleted', res.message);
      if (divisionId) await fetchSections(divisionId);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to delete section.');
    return false;
  };

  // ─── Products ───────────────────────────────────────────────────────────
  const fetchProductsPage = async (editionId, page = productsPagination.currentPage) => {
    productsLoading.value = true;
    const { data, error } = await helper.getProducts({
      editionId,
      page,
      perPage: productsPagination.perPage,
      search: productsFilters.search,
      divisionId: productsFilters.divisionId,
      sectionId: productsFilters.sectionId,
      priced: productsFilters.priced,
    });

    if (!error.value) {
      const paginated = data.value?.data ?? {};
      products.value = paginated.data ?? [];
      productsPagination.currentPage = paginated.current_page ?? 1;
      productsPagination.lastPage = paginated.last_page ?? 1;
      productsPagination.perPage = paginated.per_page ?? productsPagination.perPage;
      productsPagination.total = paginated.total ?? 0;
    } else {
      showError(error, 'Failed to fetch NSPL products.');
    }
    productsLoading.value = false;
  };

  const setProductsSearch = async (editionId, value) => {
    productsFilters.search = value ?? '';
    await fetchProductsPage(editionId, 1);
  };

  const setProductsDivision = async (editionId, divisionId) => {
    productsFilters.divisionId = divisionId || null;
    productsFilters.sectionId = null;
    await fetchProductsPage(editionId, 1);
  };

  const setProductsSection = async (editionId, sectionId) => {
    productsFilters.sectionId = sectionId || null;
    await fetchProductsPage(editionId, 1);
  };

  const setProductsPriced = async (editionId, value) => {
    productsFilters.priced = value ?? '';
    await fetchProductsPage(editionId, 1);
  };

  const setProductsPerPage = async (editionId, value) => {
    productsPagination.perPage = Math.max(10, Math.min(200, Number(value) || 50));
    await fetchProductsPage(editionId, 1);
  };

  const findProduct = async (id) => {
    const { data, error } = await helper.getProduct(id);
    if (!error.value) return data.value?.data ?? null;
    showError(error, 'Failed to fetch product.');
    return null;
  };

  const createProduct = async (payload, editionId) => {
    const { data: response, status, error } = await helper.createProduct(payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Product created', res.message);
      if (editionId) await fetchProductsPage(editionId, 1);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to create product.');
    return false;
  };

  const updateProduct = async (id, payload, editionId) => {
    const { data: response, status, error } = await helper.updateProduct(id, payload);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Product updated', res.message);
      if (editionId) await fetchProductsPage(editionId, productsPagination.currentPage);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to update product.');
    return false;
  };

  const deleteProduct = async (id, editionId) => {
    const { data: response, status, error } = await helper.deleteProduct(id);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Product deleted', res.message);
      if (editionId) await fetchProductsPage(editionId, productsPagination.currentPage);
      return true;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to delete product.');
    return false;
  };

  const importProducts = async (editionId, file) => {
    const { data: response, status, error } = await helper.importProducts(editionId, file);
    const res = response?.value;
    if (status?.value && res?.status === true) {
      showSuccess('Import complete', res.message);
      await fetchProductsPage(editionId, 1);
      return res?.data ?? null;
    }
    showError(error || ref({ data: { message: res?.message } }), 'Failed to import products.');
    return null;
  };

  return {
    // editions
    editions,
    editionsLoading,
    editionsPagination,
    editionsFilters,
    fetchEditionsPage,
    setEditionsSearch,
    setEditionsStatus,
    currentEdition,
    editionLoading,
    fetchEdition,
    createEdition,
    updateEdition,
    archiveEdition,
    publishEdition,
    cloneEdition,
    // categories
    categories,
    fetchCategories,
    // divisions
    divisions,
    fetchDivisions,
    createDivision,
    updateDivision,
    deleteDivision,
    // sections
    sections,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
    // products
    products,
    productsLoading,
    productsPagination,
    productsFilters,
    fetchProductsPage,
    setProductsSearch,
    setProductsDivision,
    setProductsSection,
    setProductsPriced,
    setProductsPerPage,
    findProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts,
  };
});
