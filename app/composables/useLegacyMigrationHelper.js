export const useLegacyMigrationHelper = () => {
  const client = useSanctumClient()

  const list = (page = 1) => client('/api/v1/legacy-migrations', { query: { page } })
  const preview = () => client('/api/v1/legacy-migrations/preview')
  const synchronizeCrosswalks = () => client('/api/v1/legacy-migrations/crosswalks/synchronize', { method: 'POST' })
  const crosswalks = () => client('/api/v1/legacy-migrations/crosswalks')
  const saveCrosswalks = (body) => client('/api/v1/legacy-migrations/crosswalks', { method: 'PUT', body })
  const start = (body) => client('/api/v1/legacy-migrations', { method: 'POST', body })
  const show = (uuid) => client(`/api/v1/legacy-migrations/${uuid}`)
  const exceptions = (uuid, page = 1) => client(`/api/v1/legacy-migrations/${uuid}/exceptions`, { query: { page } })
  const releaseNotifications = (uuid) => client(`/api/v1/legacy-migrations/${uuid}/release-notifications`, { method: 'POST' })

  const downloadReport = async (uuid) => {
    const blob = await client(`/api/v1/legacy-migrations/${uuid}/report`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `legacy-migration-${uuid}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return {
    list,
    preview,
    synchronizeCrosswalks,
    crosswalks,
    saveCrosswalks,
    start,
    show,
    exceptions,
    releaseNotifications,
    downloadReport,
  }
}
