import { defineStore } from 'pinia';

export const useSbdTemplateStore = defineStore('sbdtemplate', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getSbdTemplates,
    getSbdTemplate,
    getSbdTemplateDefaults,
    createSbdTemplate,
    updateSbdTemplate,
    deleteSbdTemplate,
  } = useSbdTemplateHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getSbdTemplates();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch SBD templates.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getSbdTemplate(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch SBD template.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const loadDefaults = async () => {
    const { data, error } = await getSbdTemplateDefaults();
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to load the default template.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createSbdTemplate(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Template saved', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to save template.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateSbdTemplate(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Template updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update template.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteSbdTemplate(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Template deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete template.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  return { items, loading, fetchAll, findOne, loadDefaults, create, update, remove };
});
