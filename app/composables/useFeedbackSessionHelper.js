export const useFeedbackSessionHelper = () => {
  const client = useSanctumClient()
  const base = '/api/v1/feedback-sessions'

  const list = params => client(base, { query: params })
  const options = () => client(`${base}/options`)
  const get = uuid => client(`${base}/${uuid}`)
  const create = payload => client(base, { method: 'POST', body: payload })
  const update = (uuid, payload) => client(`${base}/${uuid}`, { method: 'PUT', body: payload })
  const publish = uuid => client(`${base}/${uuid}/publish`, { method: 'POST' })
  const close = uuid => client(`${base}/${uuid}/close`, { method: 'POST' })
  const responses = uuid => client(`${base}/${uuid}/responses`)

  return { list, options, get, create, update, publish, close, responses }
}
