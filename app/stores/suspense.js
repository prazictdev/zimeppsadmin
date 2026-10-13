import { defineStore } from 'pinia';

export const useSuspenseStore = defineStore('suspense', () => {
  const items = ref([]);
  const loading = ref(false);

  const { getSuspenseRecords } = useSuspenseHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getSuspenseRecords();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch suspense records.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  return { items, loading, fetchAll };
});
