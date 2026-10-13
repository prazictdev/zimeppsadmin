export const useS3Upload = () => {
  const client = useSanctumClient()

  const extractError = (err, fallback) =>
    err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback

  const presignAndUpload = async (file, folder) => {
    try {
      const contentType = file.type || 'application/octet-stream'

      const presignRes = await client('/api/v1/uploads/presign', {
        method: 'POST',
        body: {
          folder,
          filename: file.name,
          content_type: contentType,
        },
      })

      const { presigned_url: presignedUrl, key } = presignRes.data

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      })

      if (!uploadRes.ok) {
        return { ok: false, key: null, error: `S3 upload failed (${uploadRes.status}).` }
      }

      return { ok: true, key, error: null }
    } catch (err) {
      return { ok: false, key: null, error: extractError(err, 'File upload failed.') }
    }
  }

  return { presignAndUpload }
}
