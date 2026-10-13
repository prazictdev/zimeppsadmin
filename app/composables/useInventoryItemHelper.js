export const useInventoryItemHelper = () => {
  const client = useSanctumClient();

  const getInventoryItems = async () => {
    try {
      const data = await client('/api/v1/inventory-items', { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const getInventoryItem = async (id) => {
    try {
      const data = await client(`/api/v1/inventory-items/${id}`, { method: 'GET' });
      return { data: ref(data), error: ref(null) };
    } catch (err) {
      return { data: ref(null), error: ref(err) };
    }
  };

  const createInventoryItem = async (payload) => {
    try {
      const data = await client('/api/v1/inventory-items', { method: 'POST', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const updateInventoryItem = async (id, payload) => {
    try {
      const data = await client(`/api/v1/inventory-items/${id}`, { method: 'PUT', body: payload });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  const deleteInventoryItem = async (id) => {
    try {
      const data = await client(`/api/v1/inventory-items/${id}`, { method: 'DELETE' });
      return { data: ref(data), status: ref(true), error: ref(null) };
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) };
    }
  };

  return { getInventoryItems, getInventoryItem, createInventoryItem, updateInventoryItem, deleteInventoryItem };
};
