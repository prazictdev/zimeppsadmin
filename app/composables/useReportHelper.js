export const useReportHelper = () => {
  const client = useSanctumClient()

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback

  const getReportTypes = async () => {
    try {
      const data = await client('/api/v1/reports/types', { method: 'GET' })
      return { ok: true, data, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to load report types.') }
    }
  }

  const generateReport = async (payload) => {
    try {
      const data = await client('/api/v1/reports/generate', { method: 'POST', body: payload })
      return { ok: true, data, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to generate report.') }
    }
  }

  const chatReport = async (message) => {
    try {
      const data = await client('/api/v1/reports/chat', { method: 'POST', body: { message } })
      return { ok: true, data, error: null }
    } catch (err) {
      return { ok: false, data: null, error: extractError(err, 'Failed to interpret your request.') }
    }
  }

  return { getReportTypes, generateReport, chatReport }
}
