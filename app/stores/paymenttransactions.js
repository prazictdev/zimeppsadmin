import { defineStore } from 'pinia'

export const usePaymentTransactionStore = defineStore('paymenttransaction', () => {
  const items = ref([])
  const pagination = ref(null)
  const loading = ref(false)

  const { getPaymentTransactions, getTransaction, getVerificationLogs, getAttachmentUrl } = usePaymentTransactionHelper()
  const toast = useToast()

  const fetchAll = async (params = {}) => {
    loading.value = true
    const { data, error } = await getPaymentTransactions(params)
    if (!error.value) {
      const payload = data.value?.data
      items.value = payload?.data ?? []
      pagination.value = payload
        ? {
            current_page: payload.current_page,
            last_page: payload.last_page,
            per_page: payload.per_page,
            total: payload.total,
          }
        : null
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch payment transactions.'
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    }
    loading.value = false
  }

  const fetchOne = async (id) => {
    const { data, error } = await getTransaction(id)
    if (!error.value) return data.value?.data ?? null
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch transaction.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return null
  }

  const fetchLogs = async (id) => {
    const { data, error } = await getVerificationLogs(id)
    if (!error.value) return data.value?.data ?? []
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch verification logs.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return []
  }

  return { items, pagination, loading, fetchAll, fetchOne, fetchLogs, getAttachmentUrl }
})
