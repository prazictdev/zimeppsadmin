export const usePaymentMethodHelper = () => {
  const client = useSanctumClient()

  const getPaymentMethodsByChannel = async (channelId) => {
    try {
      const data = await client(`/api/v1/payment-channels/${channelId}/methods`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const getPaymentMethod = async (id) => {
    try {
      const data = await client(`/api/v1/payment-methods/${id}`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const createPaymentMethod = async (channelId, payload) => {
    try {
      const data = await client(`/api/v1/payment-channels/${channelId}/methods`, { method: 'POST', body: payload })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  const updatePaymentMethod = async (id, payload) => {
    try {
      const data = await client(`/api/v1/payment-methods/${id}`, { method: 'PUT', body: payload })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  const deletePaymentMethod = async (id) => {
    try {
      const data = await client(`/api/v1/payment-methods/${id}`, { method: 'DELETE' })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  const togglePaymentMethodActive = async (id) => {
    try {
      const data = await client(`/api/v1/payment-methods/${id}/toggle-active`, { method: 'POST' })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  return {
    getPaymentMethodsByChannel,
    getPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodActive,
  }
}
