import { defineStore } from 'pinia';

export const useDistrictStore = defineStore('district', () => {
  const districts = ref(null);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(10);
  const search = ref('');
  const filterProvinceId = ref('');

  const {
    getDistricts,
    getDistrict,
    createDistrict,
    updateDistrict,
    deleteDistrict,
  } = useDistrictHelper();
  const toast = useToast();

  const fetchDistricts = async (page = 1) => {
    loading.value = true;
    currentPage.value = page;
    const { ok, data } = await getDistricts(search.value, page, perPage.value, filterProvinceId.value);
    if (ok) {
      districts.value = data;
    }
    loading.value = false;
  };

  const setSearch = (value) => {
    search.value = value;
  };

  const setFilterProvince = (id) => {
    filterProvinceId.value = id;
  };

  const create = async (payload) => {
    try {
      const { ok, data, error } = await createDistrict(payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'District created', message: data.message ?? 'District created successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'District creation failed', message: data.message ?? 'District creation failed', position: 'topRight', layout: 2 });
        }
        await fetchDistricts(1);
      } else {
        toast.error({ title: 'District creation failed', message: error ?? 'District creation failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const update = async (id, payload) => {
    try {
      const { ok, data, error } = await updateDistrict(id, payload);
      if (ok) {
        if (data?.status === 'success') {
          toast.success({ title: 'District updated', message: data.message ?? 'District updated successfully', position: 'topRight', layout: 2 });
        } else if (data?.status === 'error') {
          toast.error({ title: 'District update failed', message: data.message ?? 'District update failed', position: 'topRight', layout: 2 });
        }
        await fetchDistricts(currentPage.value);
      } else {
        toast.error({ title: 'District update failed', message: error ?? 'District update failed', position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const remove = async (id) => {
    const { ok } = await deleteDistrict(id);
    if (ok) {
      await fetchDistricts(currentPage.value);
    }
  };

  const findOne = async (id) => {
    const { ok, data } = await getDistrict(id);
    return ok ? data : null;
  };

  return {
    districts,
    loading,
    currentPage,
    perPage,
    search,
    filterProvinceId,
    fetchDistricts,
    setSearch,
    setFilterProvince,
    create,
    update,
    remove,
    findOne,
  };
});
