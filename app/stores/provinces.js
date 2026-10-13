import { defineStore } from 'pinia';

export const useProvinceStore = defineStore('province', () => {
  const provinces = ref(null);
  const allProvinces = ref([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');

  const {
    getProvinces,
    getProvince,
    createProvince,
    updateProvince,
    deleteProvince,
  } = useProvinceHelper();
  const toast = useToast();

  const fetchProvinces = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getProvinces(search.value, page, perPage.value);
    if (ok) {
      provinces.value = data;
    }
    loading.value = false;
  };

  const fetchAllProvinces = async () => {
    const { ok, data } = await getProvinces('', 1, 1000);
    if (ok) {
      allProvinces.value = data?.data ?? [];
    }
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createProvince(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Province created', message: data.message ?? 'Province created successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Province creation failed', message: data.message ?? 'Province creation failed', position: 'topRight', layout: 2 });
        }
        await fetchProvinces(1);
      } else {
        toast.error({ title: 'Province creation failed', message: error ?? 'Province creation failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { ok, data, error } = await updateProvince(id, payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'Province updated', message: data.message ?? 'Province updated successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'Province update failed', message: data.message ?? 'Province update failed', position: 'topRight', layout: 2 });
        }
        await fetchProvinces(currentPage.value);
      } else {
        toast.error({ title: 'Province update failed', message: error ?? 'Province update failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteProvince(id);
    if (ok) {
      await fetchProvinces(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getProvince(id);
    return ok ? data : null;
  };

  return {
    provinces,
    allProvinces,
    loading,
    currentPage,
    perPage,
    search,
    fetchProvinces,
    fetchAllProvinces,
    setSearch,
    create,
    update,
    remove,
    findOne,
  };
});
