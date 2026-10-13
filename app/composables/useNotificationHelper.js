export const useNotificationHelper = () => {
  const client = useSanctumClient()

  const request = async (url, options = {}, fallback = 'Notification request failed.') => {
    try {
      const response = await client(url, options)
      return { ok: true, data: response?.data ?? null, error: null }
    } catch (err) {
      const error = err?.data?.message ?? err?.response?._data?.message ?? err?.message ?? fallback
      return { ok: false, data: null, error }
    }
  }

  const getNotifications = () => request(
    '/api/v1/notifications?per_page=10&page=1',
    { method: 'GET' },
    'Failed to load notifications.',
  )

  const getUnreadCount = () => request(
    '/api/v1/notifications/unread-count',
    { method: 'GET' },
    'Failed to load the unread notification count.',
  )

  const markRead = id => request(
    `/api/v1/notifications/${id}/read`,
    { method: 'POST' },
    'Failed to mark the notification as read.',
  )

  const markActioned = id => request(
    `/api/v1/notifications/${id}/actioned`,
    { method: 'POST' },
    'Failed to mark the notification as actioned.',
  )

  const markAllRead = () => request(
    '/api/v1/notifications/mark-all-read',
    { method: 'POST' },
    'Failed to mark all notifications as read.',
  )

  return { getNotifications, getUnreadCount, markRead, markActioned, markAllRead }
}
