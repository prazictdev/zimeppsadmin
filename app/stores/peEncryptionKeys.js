import { defineStore } from 'pinia';

export const usePeEncryptionKeyStore = defineStore('peEncryptionKeys', () => {
  const itemsByCompany = ref({});      // { [companyUuid]: PeEncryptionKey[] }
  const loadingByCompany = ref({});    // { [companyUuid]: bool }
  const acting = ref(false);

  const { list, generate, compromise } = usePeEncryptionKeyHelper();
  const toast = useToast();

  const itemsFor = (companyUuid) => itemsByCompany.value[companyUuid] ?? [];
  const isLoading = (companyUuid) => !!loadingByCompany.value[companyUuid];

  const fetchFor = async (companyUuid) => {
    loadingByCompany.value = { ...loadingByCompany.value, [companyUuid]: true };
    const { data, error } = await list(companyUuid);
    if (!error.value) {
      itemsByCompany.value = { ...itemsByCompany.value, [companyUuid]: data.value?.data ?? [] };
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to load keys.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
    }
    loadingByCompany.value = { ...loadingByCompany.value, [companyUuid]: false };
  };

  const generateFor = async (companyUuid, payload = {}) => {
    acting.value = true;
    try {
      const { data: response, status, error } = await generate(companyUuid, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Keypair generated', message: res.message, position: 'topRight', layout: 2 });
        await fetchFor(companyUuid);
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to generate keypair.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } finally {
      acting.value = false;
    }
  };

  const compromiseKey = async (companyUuid, keyId, payload) => {
    acting.value = true;
    try {
      const { data: response, status, error } = await compromise(companyUuid, keyId, payload);
      const res = response?.value;
      if (status?.value && res?.status === true) {
        toast.success({ title: 'Key marked compromised', message: res.message, position: 'topRight', layout: 2 });
        await fetchFor(companyUuid);
        return true;
      }
      const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed.';
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 });
      return false;
    } finally {
      acting.value = false;
    }
  };

  return { itemsByCompany, loadingByCompany, acting, itemsFor, isLoading, fetchFor, generateFor, compromiseKey };
});
