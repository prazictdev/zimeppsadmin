export const usePaymentTransactionHelper = () => {
  const client = useSanctumClient()

  const getPaymentTransactions = async (params = {}) => {
    try {
      const query = new URLSearchParams()
      if (params.from) query.append('from', params.from)
      if (params.to) query.append('to', params.to)
      if (params.page) query.append('page', params.page)
      const qs = query.toString() ? `?${query.toString()}` : ''
      const data = await client(`/api/v1/payment-transactions${qs}`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const getTransaction = async (id) => {
    try {
      const data = await client(`/api/v1/payment-transactions/${id}`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const getVerificationLogs = async (id) => {
    try {
      const data = await client(`/api/v1/payment-transactions/${id}/logs`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const getAttachmentUrl = (id) => `/api/v1/payment-transactions/${id}/attachment`

  return { getPaymentTransactions, getTransaction, getVerificationLogs, getAttachmentUrl }
}
