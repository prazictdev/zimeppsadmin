import { defineStore } from 'pinia';

export const useCompetitionScopeThresholdStore = defineStore('competition-scope-thresholds', () => {
  const items = ref([]);
  const groups = ref([]);
  const currencies = ref([]);
  const loading = ref(false);
  const helper = useCompetitionScopeThresholdHelper();
  const toast = useToast();

  const errorMessage = (error, fallback) => error?.value?.data?.message || error?.value?.message || fallback;

  const fetchAll = async () => {
    loading.value = true;
    const [thresholds, groupList, currencyList] = await Promise.all([
      helper.getAll(),
      helper.getGroups(),
      helper.getCurrencies(),
    ]);
    if (!thresholds.error.value) items.value = thresholds.data.value?.data ?? [];
    if (!groupList.error.value) groups.value = groupList.data.value?.data ?? [];
    if (!currencyList.error.value) currencies.value = currencyList.data.value?.data ?? [];
    if (thresholds.error.value) {
      toast.error({ title: 'Unable to load thresholds', message: errorMessage(thresholds.error, 'Please try again.'), position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const mutate = async (operation, successTitle) => {
    loading.value = true;
    const { data, error } = await operation();
    if (error.value) {
      toast.error({ title: 'Unable to save', message: errorMessage(error, 'Please check the values and try again.'), position: 'topRight', layout: 2 });
      loading.value = false;
      return false;
    }
    toast.success({ title: successTitle, message: data.value?.message, position: 'topRight', layout: 2 });
    await fetchAll();
    return true;
  };

  return {
    items,
    groups,
    currencies,
    loading,
    fetchAll,
    create: payload => mutate(() => helper.create(payload), 'Threshold created'),
    update: (id, payload) => mutate(() => helper.update(id, payload), 'Threshold updated'),
    remove: id => mutate(() => helper.remove(id), 'Threshold removed'),
    autofill: () => mutate(() => helper.autofill(), 'Legal baselines applied'),
  };
});
