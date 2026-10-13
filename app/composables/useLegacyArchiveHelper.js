export const useLegacyArchiveHelper = () => {
  const client = useSanctumClient()

  const request = (resource, query = {}) => client(`/api/v1/legacy-archive/${resource}`, { query })
  const tenders = (query) => request('tenders', query)
  const tender = (uuid) => request(`tenders/${uuid}`)
  const awards = (query) => request('awards', query)
  const contracts = (query) => request('contracts', query)

  return { tenders, tender, awards, contracts }
}
