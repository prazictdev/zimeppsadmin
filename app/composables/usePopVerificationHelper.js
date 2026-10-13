export const usePopVerificationHelper = () => {
  const client = useSanctumClient()

  const list = async (params = {}) => {
    try {
      const qs = new URLSearchParams()
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') qs.set(k, v)
      }
      const url = `/api/v1/pop-verifications${qs.toString() ? `?${qs}` : ''}`
      const data = await client(url, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const manualVerify = async (invoiceId, payload = {}) => {
    try {
      const data = await client(`/api/v1/pop-verifications/${invoiceId}/manual-verify`, {
        method: 'POST',
        body: payload,
      })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const cancel = async (invoiceId, payload) => {
    try {
      const data = await client(`/api/v1/pop-verifications/${invoiceId}/cancel`, {
        method: 'POST',
        body: payload,
      })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const popUrl = async (invoiceId) => {
    try {
      const data = await client(`/api/v1/pop-verifications/${invoiceId}/pop-url`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const searchBankTransactions = async (invoiceId) => {
    try {
      const data = await client(`/api/v1/pop-verifications/${invoiceId}/search-bank-transactions`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const manualBankSearch = async (invoiceId, q) => {
    try {
      const qs = new URLSearchParams({ q }).toString()
      const data = await client(`/api/v1/pop-verifications/${invoiceId}/manual-bank-search?${qs}`, { method: 'GET' })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  const claimAndSettle = async (invoiceId, payload) => {
    try {
      const data = await client(`/api/v1/pop-verifications/${invoiceId}/claim-and-settle`, {
        method: 'POST',
        body: payload,
      })
      return { data: ref(data), error: ref(null) }
    } catch (err) {
      return { data: ref(null), error: ref(err) }
    }
  }

  return { list, manualVerify, cancel, popUrl, searchBankTransactions, manualBankSearch, claimAndSettle }
}
