import { defineStore } from 'pinia';

export const useCommitteeDefinitionStore = defineStore('committeeDefinitions', () => {
  const items = ref([]);
  const loading = ref(false);
  const api = useCommitteeDefinitionHelper();
  const toast = useToast();

  const message = (error, fallback) => error?.value?.data?.message || error?.value?.message || fallback;

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await api.getCommittees();
    if (!error.value) items.value = data.value?.data ?? [];
    else toast.error({ title: 'Error', message: message(error, 'Failed to load committees.'), position: 'topRight', layout: 2 });
    loading.value = false;
  };

  const save = async (payload, id = null) => {
    const result = id ? await api.updateCommittee(id, payload) : await api.createCommittee(payload);
    if (!result.status.value) {
      toast.error({ title: 'Error', message: message(result.error, 'Failed to save committee.'), position: 'topRight', layout: 2 });
      return { ok: false, error: result.error.value };
    }
    toast.success({ title: id ? 'Committee updated' : 'Committee created', message: result.data.value?.message, position: 'topRight', layout: 2 });
    await fetchAll();
    return { ok: true };
  };

  const remove = async (id) => {
    const result = await api.deleteCommittee(id);
    if (!result.status.value) {
      toast.error({ title: 'Error', message: message(result.error, 'Failed to delete committee.'), position: 'topRight', layout: 2 });
      return false;
    }
    toast.success({ title: 'Committee deleted', message: result.data.value?.message, position: 'topRight', layout: 2 });
    await fetchAll();
    return true;
  };

  return { items, loading, fetchAll, save, remove };
});
