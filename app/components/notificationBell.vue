<template>
  <details ref="dropdown" class="dropdown dropdown-end">
    <summary
      class="btn btn-ghost btn-circle relative list-none"
      aria-label="Open notifications"
      title="Notifications"
      @click="handleOpen"
    >
      <Icon name="lucide:bell" class="h-5 w-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[0.65rem] font-bold leading-none text-error-content ring-2 ring-base-100"
      >
        {{ counterLabel }}
      </span>
    </summary>

    <div class="dropdown-content z-[70] mt-2 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-2xl">
      <header class="flex items-center justify-between gap-3 border-b border-base-200 bg-slate-950 px-4 py-3 text-white">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-bold">Notifications</h2>
            <span v-if="unreadCount" class="badge badge-sm border-0 bg-error text-error-content">{{ unreadCount }} new</span>
          </div>
          <p class="mt-0.5 text-xs text-slate-400">Updates and assigned actions</p>
        </div>
        <button
          v-if="unreadCount"
          type="button"
          class="btn btn-ghost btn-xs text-slate-200 hover:bg-white/10"
          :disabled="markingAll"
          @click="readAll"
        >
          <span v-if="markingAll" class="loading loading-spinner loading-xs" />
          <Icon v-else name="lucide:check-check" class="h-3.5 w-3.5" />
          Read all
        </button>
      </header>

      <div v-if="loading" class="grid min-h-40 place-items-center">
        <span class="loading loading-spinner loading-md text-primary" />
      </div>

      <div v-else-if="error" class="p-4">
        <div role="alert" class="alert alert-warning text-sm">
          <Icon name="lucide:triangle-alert" class="h-4 w-4" />
          <span class="flex-1">{{ error }}</span>
          <button type="button" class="btn btn-xs" @click="loadNotifications">Retry</button>
        </div>
      </div>

      <div v-else-if="notifications.length" class="max-h-[28rem] divide-y divide-base-200 overflow-y-auto">
        <button
          v-for="notification in notifications"
          :key="notification.id"
          type="button"
          class="group flex w-full gap-3 p-4 text-left transition hover:bg-base-200/45"
          :class="notification.read_at ? 'bg-base-100' : 'bg-blue-50/60'"
          @click="openNotification(notification)"
        >
          <span :class="['mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconClass(notification)]">
            <Icon :name="iconName(notification)" class="h-4 w-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-start gap-2">
              <span class="line-clamp-2 flex-1 text-sm font-bold">{{ title(notification) }}</span>
              <span v-if="!notification.read_at" class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
            </span>
            <span class="mt-1 line-clamp-2 block text-xs leading-relaxed text-base-content/55">{{ message(notification) }}</span>
            <span class="mt-1.5 flex items-center gap-1 text-[0.68rem] text-base-content/40">
              <Icon name="lucide:clock-3" class="h-3 w-3" />{{ timeLabel(notification.created_at) }}
            </span>
          </span>
          <Icon v-if="notificationUrl(notification)" name="lucide:chevron-right" class="mt-2 h-4 w-4 shrink-0 text-base-content/20 group-hover:text-primary" />
        </button>
      </div>

      <div v-else class="flex min-h-44 flex-col items-center justify-center p-6 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-base-200 text-base-content/35"><Icon name="lucide:bell-off" class="h-6 w-6" /></span>
        <p class="mt-3 text-sm font-bold">No notifications yet</p>
        <p class="mt-1 text-xs text-base-content/45">New assignments and workflow updates will appear here.</p>
      </div>
    </div>
  </details>
</template>

<script setup>
const { getNotifications, getUnreadCount, markRead, markActioned, markAllRead } = useNotificationHelper()
const { user } = useSanctumAuth()
const dropdown = ref(null)
const notifications = ref([])
const unreadCount = ref(0)
const loading = ref(false)
const loaded = ref(false)
const markingAll = ref(false)
const error = ref(null)
let refreshTimer = null

const counterLabel = computed(() => unreadCount.value > 99 ? '99+' : unreadCount.value)
const currentUserId = computed(() => user.value?.data?.user?.id ?? null)

function resetForUser() {
  dropdown.value?.removeAttribute('open')
  notifications.value = []
  unreadCount.value = 0
  loaded.value = false
  error.value = null
}

async function loadCount() {
  const result = await getUnreadCount()
  if (result.ok) unreadCount.value = Number(result.data?.count || 0)
}

async function loadNotifications() {
  loading.value = true
  error.value = null
  const result = await getNotifications()
  if (result.ok) {
    notifications.value = result.data?.data ?? []
    loaded.value = true
  } else {
    error.value = result.error
  }
  loading.value = false
}

function handleOpen(event) {
  if (!event.currentTarget.parentElement.open || !loaded.value) loadNotifications()
  loadCount()
}

async function readAll() {
  markingAll.value = true
  const result = await markAllRead()
  if (result.ok) {
    unreadCount.value = 0
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      read_at: notification.read_at || new Date().toISOString(),
    }))
  }
  markingAll.value = false
}

async function openNotification(notification) {
  const url = notificationUrl(notification)
  const result = url ? await markActioned(notification.id) : await markRead(notification.id)
  if (result.ok && !notification.read_at) unreadCount.value = Math.max(0, unreadCount.value - 1)

  notification.read_at = notification.read_at || new Date().toISOString()
  if (url) {
    dropdown.value?.removeAttribute('open')
    await navigateTo(url)
  }
}

function notificationUrl(notification) {
  const data = notification.data ?? {}
  if (data.url) return data.url
  if (data.kind === 'tender_workflow' && data.tender_uuid) return `/tenders/${data.tender_uuid}`
  if (data.kind === 'lcs_workflow' && data.tender_uuid) return `/evaluations/least-cost-selection/${data.tender_uuid}`
  if (data.kind === 'supplement_workflow' && data.plan_uuid) return `/admin-plan-dashboard/plans/${data.plan_uuid}?tab=supplements&supplement=${data.supplement_uuid}`
  return null
}

function title(notification) {
  return notification.data?.subject || 'Notification'
}

function message(notification) {
  return notification.data?.message || 'You have a new update.'
}

function iconName(notification) {
  const kind = notification.data?.kind
  if (kind === 'supplier_registration_assignment') return 'lucide:clipboard-user'
  if (kind === 'supplier_registration_requirement_actioned') return 'lucide:message-square-check'
  if (kind === 'tender_workflow') return 'lucide:file-check-2'
  if (kind === 'lcs_workflow') return 'lucide:scale'
  if (kind === 'supplement_workflow') return 'lucide:file-plus-2'
  return 'lucide:bell-ring'
}

function iconClass(notification) {
  const kind = notification.data?.kind
  if (kind === 'supplier_registration_assignment') return 'bg-violet-100 text-violet-700'
  if (kind === 'supplier_registration_requirement_actioned') return 'bg-emerald-100 text-emerald-700'
  if (kind === 'tender_workflow') return 'bg-blue-100 text-blue-700'
  if (kind === 'lcs_workflow') return 'bg-amber-100 text-amber-700'
  if (kind === 'supplement_workflow') return 'bg-cyan-100 text-cyan-700'
  return 'bg-base-200 text-base-content/60'
}

function timeLabel(value) {
  if (!value) return 'Time unavailable'
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(value).toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(() => {
  loadCount()
  refreshTimer = setInterval(loadCount, 60000)
})

watch(currentUserId, (userId, previousUserId) => {
  if (userId === previousUserId) return
  resetForUser()
  if (userId) loadCount()
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>
