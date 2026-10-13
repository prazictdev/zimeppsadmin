export const useRegistrationHelper = () => {
  const client = useSanctumClient()

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback

  const getSupplierRegistrations = async (params = {}) => {
    try {
      const query = new URLSearchParams()
      if (params.year) query.append('year', params.year)
      if (params.page) query.append('page', params.page)
      if (params.per_page) query.append('per_page', params.per_page)
      if (params.company) query.append('company', params.company)
      const qs = query.toString() ? `?${query.toString()}` : ''
      const data = await client(`/api/v1/registrations/suppliers${qs}`, { method: 'GET' })
      return { ok: true, data, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to fetch registrations.') }
    }
  }

  const getSupplierRegistration = async (companyId) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}`, { method: 'GET' })
      return { ok: true, data, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to fetch company profile.') }
    }
  }

  const getActioningUsers = async (search = '') => {
    try {
      const query = new URLSearchParams()
      if (search) query.append('search', search)
      const qs = query.toString() ? `?${query.toString()}` : ''
      const data = await client(`/api/v1/registrations/actioning-users${qs}`, { method: 'GET' })
      return { ok: true, data: data?.data ?? [], error: null }
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to fetch actioning officers.') }
    }
  }

  const getRegistrationAnalytics = async (year) => {
    try {
      const data = await client(`/api/v1/registrations/analytics?year=${encodeURIComponent(year)}`, { method: 'GET' })
      return { ok: true, data, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to fetch registration analytics.') }
    }
  }

  const assignSupplierRegistration = async (companyId, payload) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/assignment`, { method: 'POST', body: payload })
      return { ok: true, data: data?.data ?? null, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to assign supplier registration.') }
    }
  }

  const fetchDocumentUrl = async (documentId) => {
    try {
      const data = await client(`/api/v1/registrations/documents/${documentId}`, { method: 'GET' })
      return { ok: true, data: data?.data ?? null, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to retrieve document.') }
    }
  }

  const fetchDirectorDocumentUrl = async (directorId) => {
    try {
      const data = await client(`/api/v1/registrations/directors/${directorId}/document`, { method: 'GET' })
      return { ok: true, data: data?.data ?? null, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to retrieve director document.') }
    }
  }

  const fetchShareholderDocumentUrl = async (shareholderId) => {
    try {
      const data = await client(`/api/v1/registrations/shareholders/${shareholderId}/document`, { method: 'GET' })
      return { ok: true, data: data?.data ?? null, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to retrieve shareholder document.') }
    }
  }

  const getComments = async (companyId) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/comments`, { method: 'GET' })
      return { ok: true, data: data?.data ?? [], error: null }
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to load comments.') }
    }
  }

  const postComment = async (companyId, payload) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/comments`, { method: 'POST', body: payload })
      return { ok: true, data: data?.data ?? null, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to save comment.') }
    }
  }

  const approveRegistration = async (companyId) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/approve`, { method: 'POST' })
      return { ok: true, data: data?.data ?? null, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to approve registration.') }
    }
  }

  const getRegistrationLogs = async (companyId) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/logs`, { method: 'GET' })
      return { ok: true, data: data?.data ?? [], error: null }
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to load AI review logs.') }
    }
  }

  const getRegistrationReviews = async (companyId) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/reviews`, { method: 'GET' })
      return { ok: true, data: data?.data ?? [], error: null }
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to load AI review summary.') }
    }
  }

  const getRegistrationReviewRuns = async (companyId) => {
    try {
      const data = await client(`/api/v1/registrations/suppliers/${companyId}/review-runs`, { method: 'GET' })
      return { ok: true, data: data?.data ?? [], error: null }
    } catch (err) {
      return { ok: false, data: [], error: extractError(err, 'Failed to load AI review execution history.') }
    }
  }

  return { getSupplierRegistrations, getSupplierRegistration, getActioningUsers, getRegistrationAnalytics, assignSupplierRegistration, fetchDocumentUrl, fetchDirectorDocumentUrl, fetchShareholderDocumentUrl, getComments, postComment, approveRegistration, getRegistrationLogs, getRegistrationReviews, getRegistrationReviewRuns }
}
