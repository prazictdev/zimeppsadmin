import { defineStore } from 'pinia'

export const useRegistrationStore = defineStore('registration', () => {
  const items = ref([])
  const pagination = ref(null)
  const loading = ref(false)
  const actioningUsers = ref([])
  const actioningUsersLoading = ref(false)

  const { getSupplierRegistrations, getSupplierRegistration, getActioningUsers, assignSupplierRegistration, fetchDocumentUrl, fetchDirectorDocumentUrl, fetchShareholderDocumentUrl, getComments, postComment, approveRegistration, getRegistrationLogs, getRegistrationReviews, getRegistrationReviewRuns } = useRegistrationHelper()
  const toast = useToast()

  const fetchAll = async (params = {}) => {
    loading.value = true
    const { ok, data, error } = await getSupplierRegistrations(params)
    if (ok) {
      const payload = data?.data
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
      toast.error({ title: 'Error', message: error, position: 'topRight', layout: 2 })
    }
    loading.value = false
  }

  const fetchOne = async (companyId) => {
    const { ok, data, error } = await getSupplierRegistration(companyId)
    if (ok) return data?.data ?? null
    toast.error({ title: 'Error', message: error, position: 'topRight', layout: 2 })
    return null
  }

  const fetchActioningUsers = async (search = '') => {
    actioningUsersLoading.value = true
    const { ok, data, error } = await getActioningUsers(search)
    actioningUsers.value = ok ? data : []
    if (!ok) toast.error({ title: 'Error', message: error, position: 'topRight', layout: 2 })
    actioningUsersLoading.value = false
  }

  const assignActioningOfficer = async (companyId, payload) => {
    const { ok, data, error } = await assignSupplierRegistration(companyId, payload)
    if (!ok) {
      toast.error({ title: 'Assignment failed', message: error, position: 'topRight', layout: 2 })
      return false
    }

    const item = items.value.find(registration => registration.company_id === companyId)
    if (item) item.assignment = data
    toast.success({ title: 'Assigned', message: 'The supplier application has been assigned for actioning.', position: 'topRight', layout: 2 })
    return true
  }

  return { items, pagination, loading, actioningUsers, actioningUsersLoading, fetchAll, fetchOne, fetchActioningUsers, assignActioningOfficer, fetchDocumentUrl, fetchDirectorDocumentUrl, fetchShareholderDocumentUrl, getComments, postComment, approveRegistration, getRegistrationLogs, getRegistrationReviews, getRegistrationReviewRuns }
})
