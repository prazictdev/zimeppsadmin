import { defineStore } from 'pinia';

export const useSbdSectionStore = defineStore('sbdsection', () => {
  const items = ref([]);
  const loading = ref(false);

  const { getSbdSections, createSbdSection, updateSbdSection, deleteSbdSection } = useSbdSectionHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getSbdSections();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch SBD sections.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createSbdSection(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Section saved', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to save section.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateSbdSection(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Section updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update section.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteSbdSection(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Section deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete section.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return { items, loading, fetchAll, create, update, remove };
});
