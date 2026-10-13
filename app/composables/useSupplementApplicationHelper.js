export const useSupplementApplicationHelper = () => {
  const client = useSanctumClient()

  const fetchLane = async (params = {}) => {
    try {
      const query = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
      }
      const data = await client(`/api/v1/supplements${query.toString() ? `?${query}` : ''}`, { method: 'GET' })
      return { ok: true, data, error: null }
    } catch (error) {
      return { ok: false, data: null, error }
    }
  }

  return { fetchLane }
}
