export const useMyTaskHelper = () => {
  const client = useSanctumClient()

  const getMyTasks = async () => {
    try {
      const response = await client('/api/v1/my-tasks', { method: 'GET' })
      return { ok: true, data: response?.data ?? [], error: null }
    } catch (err) {
      const error = err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? 'Failed to load assigned tasks.'
      return { ok: false, data: [], error }
    }
  }

  return { getMyTasks }
}
