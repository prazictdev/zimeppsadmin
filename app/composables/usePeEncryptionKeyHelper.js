export const usePeEncryptionKeyHelper = () => {
  const client = useSanctumClient();

  const list = async (companyUuid) => {
    try {
      const data = await client(`/api/v1/procurement-entities/${companyUuid}/encryption-keys`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const generate = async (companyUuid, payload = {}) => {
    try {
      const data = await client(`/api/v1/procurement-entities/${companyUuid}/encryption-keys`, { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const compromise = async (companyUuid, keyId, payload) => {
    try {
      const data = await client(`/api/v1/procurement-entities/${companyUuid}/encryption-keys/${keyId}/compromise`, { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { list, generate, compromise };
};
