import { defineStore } from 'pinia'

export const usePaymentChannelStore = defineStore('paymentchannel', () => {
  const items = ref([])
  const loading = ref(false)
  const togglingId = ref(null)

  const {
    getPaymentChannels,
    getPaymentChannel,
    createPaymentChannel,
    updatePaymentChannel,
    deletePaymentChannel,
    togglePaymentChannelActive,
  } = usePaymentChannelHelper()
  const toast = useToast()

  const fetchAll = async () => {
    loading.value = true
    const { data, error } = await getPaymentChannels()
    if (!error.value) {
      items.value = data.value?.data ?? []
    } else {
      const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch payment channels.'
      toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    }
    loading.value = false
  }

  const findOne = async (id) => {
    const { data, error } = await getPaymentChannel(id)
    if (!error.value) return data.value?.data ?? null
    const msg = error.value?.data?.message || error.value?.message || 'Failed to fetch payment channel.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return null
  }

  const create = async (payload) => {
    const { data: response, status, error } = await createPaymentChannel(payload)
    const res = response?.value
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Channel created', message: res.message, position: 'topRight', layout: 2 })
      await fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to create payment channel.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  const update = async (id, payload) => {
    const { data: response, status, error } = await updatePaymentChannel(id, payload)
    const res = response?.value
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Channel updated', message: res.message, position: 'topRight', layout: 2 })
      await fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || res?.message || 'Failed to update payment channel.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  const remove = async (id) => {
    const { data: response, status, error } = await deletePaymentChannel(id)
    const res = response?.value
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Channel deleted', message: res.message, position: 'topRight', layout: 2 })
      await fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || 'Failed to delete payment channel.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  const toggleActive = async (id) => {
    togglingId.value = id
    const { data: response, status, error } = await togglePaymentChannelActive(id)
    const res = response?.value
    togglingId.value = null
    if (status?.value && res?.status === true) {
      toast.success({ title: 'Status updated', message: res.message, position: 'topRight', layout: 2 })
      await fetchAll()
      return true
    }
    const msg = error?.value?.data?.message || error?.value?.message || 'Failed to update status.'
    toast.error({ title: 'Error', message: msg, position: 'topRight', layout: 2 })
    return false
  }

  return { items, loading, togglingId, fetchAll, findOne, create, update, remove, toggleActive }
})
