import { defineStore } from 'pinia'

export const usePaymentMethodStore = defineStore('paymentmethod', () => {
  const items = ref([])
  const loading = ref(false)
  const togglingId = ref(null)

  const {
    getPaymentMethodsByChannel,
    getPaymentMethod,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    togglePaymentMethodActive,
  } = usePaymentMethodHelper()
  const channelStore = usePaymentChannelStore()
  const toast = useToast()

  const fetchByChannel = async (channelId) => {
    loading.value = true
    const { data, error } = await getPaymentMethodsByChannel(channelId)
    if (!error.value) {
      items.value = data.value?.data ?? []
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch payment methods.'
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    }
    loading.value = false
  }

  const findOne = async (id) => {
    const { data, error } = await getPaymentMethod(id)
    if (!error.value) return data.value?.data ?? null
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch payment method.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return null
  }

  const create = async (channelId, payload) => {
    const { data: response, status, error } = await createPaymentMethod(channelId, payload)
    const res = response?.value
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Method created', message: res.message, position: 'topRight', layout: 2 })
      await fetchByChannel(channelId)
      await channelStore.fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create payment method.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  const update = async (id, channelId, payload) => {
    const { data: response, status, error } = await updatePaymentMethod(id, payload)
    const res = response?.value
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Method updated', message: res.message, position: 'topRight', layout: 2 })
      await fetchByChannel(channelId)
      await channelStore.fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update payment method.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  const remove = async (id, channelId) => {
    const { data: response, status, error } = await deletePaymentMethod(id)
    const res = response?.value
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Method deleted', message: res.message, position: 'topRight', layout: 2 })
      await fetchByChannel(channelId)
      await channelStore.fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete payment method.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  const toggleActive = async (id, channelId) => {
    togglingId.value = id
    const { data: response, status, error } = await togglePaymentMethodActive(id)
    const res = response?.value
    togglingId.value = null
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Status updated', message: res.message, position: 'topRight', layout: 2 })
      await fetchByChannel(channelId)
      await channelStore.fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || 'Failed to update status.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  return { items, loading, togglingId, fetchByChannel, findOne, create, update, remove, toggleActive }
})
