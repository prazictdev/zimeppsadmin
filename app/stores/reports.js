import { defineStore } from 'pinia'

export const useReportStore = defineStore('report', () => {
  const payload = ref(null)
  const types = ref([])
  const loading = ref(false)
  const typesLoading = ref(false)
  const error = ref(null)
  const lastRequestParams = ref(null)

  const { getReportTypes, generateReport, chatReport } = useReportHelper()
  const toast = useToast()

  const fetchTypes = async () => {
    typesLoading.value = true
    const { ok, data, error: err } = await getReportTypes()
    if (ok) {
      types.value = data?.data ?? []
    } else {
      toast.error({ title: 'Report types', message: err ?? 'Failed to load report types.' })
    }
    typesLoading.value = false
  }

  const generate = async (params) => {
    loading.value = true
    error.value = null
    lastRequestParams.value = params
    const { ok, data, error: err } = await generateReport(params)
    if (ok && data?.status) {
      payload.value = data.data ?? null
    } else {
      error.value = err ?? data?.message ?? 'Failed to generate report.'
      toast.error({ title: 'Report generation failed', message: error.value })
    }
    loading.value = false
    return ok
  }

  /**
   * Send a natural-language request. Returns { understood, reply, report }.
   * When a report comes back it is also stored as the active payload so the
   * viewer page can open it full-screen.
   */
  const chat = async (message) => {
    loading.value = true
    error.value = null
    const { ok, data, error: err } = await chatReport(message)
    loading.value = false

    if (!ok || !data?.status) {
      const reply = err ?? data?.message ?? 'Sorry, something went wrong interpreting your request.'
      error.value = reply
      return { understood: false, reply, report: null }
    }

    const result = data.data ?? {}
    if (result.report) {
      payload.value = result.report
    }
    return {
      understood: !!result.understood,
      reply: result.reply ?? '',
      report: result.report ?? null,
    }
  }

  const reset = () => {
    payload.value = null
    error.value = null
    lastRequestParams.value = null
  }

  return {
    payload,
    types,
    loading,
    typesLoading,
    error,
    lastRequestParams,
    fetchTypes,
    generate,
    chat,
    reset,
  }
})
