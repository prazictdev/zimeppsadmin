import { defineStore } from 'pinia'

export const useSupplementApplicationStore = defineStore('supplementApplications', () => {
  const lanes = ref({})
  const search = ref('')
  const assignedToMe = ref(false)
  const { fetchLane } = useSupplementApplicationHelper()

  const emptyMeta = () => ({ current_page: 1, last_page: 1, total: 0, per_page: 25 })
  const emptyLane = () => ({ applications: [], meta: emptyMeta(), loading: false, loaded: false, error: null })
  const lane = status => lanes.value[status] ?? emptyLane()

  const loadLane = async (status, page = 1) => {
    if (!lanes.value[status]) lanes.value[status] = emptyLane()
    const target = lanes.value[status]
    target.loading = true
    target.error = null

    const { ok, data } = await fetchLane({
      status,
      page,
      per_page: target.meta.per_page,
      search: search.value || undefined,
      assigned_to_me: assignedToMe.value ? 1 : undefined,
    })

    if (ok) {
      const payload = data?.data ?? {}
      target.applications = payload.data ?? []
      target.meta = {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        total: payload.total ?? 0,
        per_page: payload.per_page ?? target.meta.per_page,
      }
      target.loaded = true
    } else {
      target.error = 'Unable to load this supplement lane.'
    }
    target.loading = false
  }

  const loadAll = statuses => Promise.all(statuses.map(status => loadLane(status, 1)))

  const reload = async (statuses) => {
    lanes.value = {}
    await loadAll(statuses)
  }

  const setSearch = async (value, statuses) => {
    search.value = value
    await reload(statuses)
  }

  const setAssignedToMe = async (value, statuses) => {
    assignedToMe.value = value
    await reload(statuses)
  }

  return { lanes, search, assignedToMe, lane, loadLane, loadAll, reload, setSearch, setAssignedToMe }
})
