export const usePaymentChannelHelper = () => {
  const client = useSanctumClient()

  const getPaymentChannels = async () => {
    try {
      const data = await client('/api/v1/payment-channels', { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const getPaymentChannel = async (id) => {
    try {
      const data = await client(`/api/v1/payment-channels/${id}`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const createPaymentChannel = async (payload) => {
    try {
      const data = await client('/api/v1/payment-channels', { method: 'POST', body: payload })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  const updatePaymentChannel = async (id, payload) => {
    try {
      const data = await client(`/api/v1/payment-channels/${id}`, { method: 'PUT', body: payload })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  const deletePaymentChannel = async (id) => {
    try {
      const data = await client(`/api/v1/payment-channels/${id}`, { method: 'DELETE' })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  const togglePaymentChannelActive = async (id) => {
    try {
      const data = await client(`/api/v1/payment-channels/${id}/toggle-active`, { method: 'POST' })
      return { data: ref(data), status: ref(true), error: ref(null) }
    } catch (err) {
      return { data: ref(null), status: ref(false), error: ref(err) }
    }
  }

  return {
    getPaymentChannels,
    getPaymentChannel,
    createPaymentChannel,
    updatePaymentChannel,
    deletePaymentChannel,
    togglePaymentChannelActive,
  }
}
