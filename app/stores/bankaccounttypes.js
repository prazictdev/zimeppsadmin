import { defineStore } from 'pinia';

export const useBankAccountTypeStore = defineStore('bankaccounttype', () => {
  const items = ref([]);
  const loading = ref(false);
  const { getBankAccountTypes, getBankAccountType } = useBankAccountTypeHelper();
  const toast = useToast();

  const reportError = (error, fallback) => {
    const message = error?.value?.data?.message || error?.value?.message || fallback;
    toast.error({ title: 'CRM reference error', message, position: 'topRight', layout: 2 });
  };

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getBankAccountTypes();
    if (!error.value) items.value = data.value?.data ?? [];
    else reportError(error, 'Failed to fetch bank-account-type references.');
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getBankAccountType(id);
    if (!error.value) return data.value?.data ?? null;
    reportError(error, 'Failed to fetch the bank-account-type reference.');
    return null;
  };

  return { items, loading, fetchAll, findOne };
});
