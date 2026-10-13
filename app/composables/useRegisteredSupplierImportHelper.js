export const useRegisteredSupplierImportHelper = () => {
  const client = useSanctumClient()

  const requestFile = async (url, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return client(url, { method: 'POST', body: formData })
  }

  const preview = (file) => requestFile('/api/v1/registered-supplier-imports/preview', file)
  const start = (file) => requestFile('/api/v1/registered-supplier-imports', file)
  const show = (uuid) => client(`/api/v1/registered-supplier-imports/${uuid}`, { method: 'GET' })

  const downloadResults = async (uuid) => {
    const blob = await client(`/api/v1/registered-supplier-imports/${uuid}/results`, {
      method: 'GET',
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `registered-supplier-import-${uuid}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return { preview, start, show, downloadResults }
}
