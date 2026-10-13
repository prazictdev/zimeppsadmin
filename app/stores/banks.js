import { defineStore } from 'pinia';

export const useBankStore = defineStore('bank', () => {
  const items = ref([]);
  const loading = ref(false);
  const { getBanks, getBank } = useBankHelper();
  const toast = useToast();

  const reportError = (error, fallback) => {
    const message = error?.value?.data?.message || error?.value?.message || fallback;
    toast.error({ title: 'CRM reference error', message, position: 'topRight', layout: 2 });
  };

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getBanks();
    if (!error.value) items.value = data.value?.data ?? [];
    else reportError(error, 'Failed to fetch bank references.');
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getBank(id);
    if (!error.value) return data.value?.data ?? null;
    reportError(error, 'Failed to fetch the bank reference.');
    return null;
  };

  return { items, loading, fetchAll, findOne };
});
