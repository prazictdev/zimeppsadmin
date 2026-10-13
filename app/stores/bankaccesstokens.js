import { defineStore } from 'pinia';

export const useBankAccessTokenStore = defineStore('bankaccesstoken', () => {
  const items = ref([]);
  const loading = ref(false);

  const {
    getBankAccessTokens,
    getBankAccessToken,
    createBankAccessToken,
    updateBankAccessToken,
    deleteBankAccessToken,
    regenerateBankAccessToken,
  } = useBankAccessTokenHelper();
  const toast = useToast();

  const fetchAll = async () => {
    loading.value = true;
    const { data, error } = await getBankAccessTokens();
    if (!error.value) {
      items.value = data.value?.data ?? [];
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch bank access tokens.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loading.value = false;
  };

  const findOne = async (id) => {
    const { data, error } = await getBankAccessToken(id);
    if (!error.value) return data.value?.data ?? null;
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch bank access token.';
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    return null;
  };

  const create = async (payload) => {
    try {
      const { data: response, status, error } = await createBankAccessToken(payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Token created', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return res.data;
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create bank access token.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const update = async (id, payload) => {
    try {
      const { data: response, status, error } = await updateBankAccessToken(id, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Token updated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update bank access token.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const remove = async (id) => {
    try {
      const { data: response, status, error } = await deleteBankAccessToken(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Token deleted', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete bank access token.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const regenerate = async (id) => {
    try {
      const { data: response, status, error } = await regenerateBankAccessToken(id);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Token regenerated', message: res.message, position: 'topRight', layout: 2 });
        await fetchAll();
        return res.data;
      } else {
        const msg = error?.value?.data?.message || error?.value?.message || 'Failed to regenerate token.';
        toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return { items, loading, fetchAll, findOne, create, update, remove, regenerate };
});
