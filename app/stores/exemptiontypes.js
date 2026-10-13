import { defineStore } from 'pinia';

export const useExemptionTypeStore = defineStore('exemptiontypes', () => {
  const api = useExemptionTypeHelper();
  const toast = useToast();
  const items = ref([]);
  const loading = ref(false);
  const message = (error, fallback) => error?.data?.message || error?.message || fallback;

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await api.list();
    loading.value = false;
    if (error) toast.error({ title: 'Error', message: message(error, 'Could not load exemption types.'), position: 'topRight', layout: 2 });
    else { const payload = data?.data; items.value = Array.isArray(payload) ? payload : (payload?.data ?? []); }
  };

  const mutate = async (operation, fallback) => {
    const { data, error } = await operation();
    if (error || data?.status === false) {
      toast.error({ title: 'Error', message: message(error ?? data, fallback), position: 'topRight', layout: 2 });
      return false;
    }
    toast.success({ title: 'Exemption types', message: data?.message || 'Changes saved.', position: 'topRight', layout: 2 });
    await fetchAll();
    return true;
  };

  return {
    items, loading, fetchAll,
    create: payload => mutate(() => api.create(payload), 'Could not create the exemption type.'),
    update: (id, payload) => mutate(() => api.update(id, payload), 'Could not update the exemption type.'),
    archive: id => mutate(() => api.archive(id), 'Could not archive the exemption type.'),
  };
});
