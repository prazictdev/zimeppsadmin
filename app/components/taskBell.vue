<template>
  <details ref="dropdown" class="dropdown dropdown-end">
    <summary
      class="btn btn-ghost btn-circle relative list-none"
      aria-label="Open my tasks"
      title="My Tasks"
      @click="handleOpen"
    >
      <Icon name="lucide:clipboard-check" class="h-5 w-5" />
      <span
        v-if="tasks.length"
        class="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-violet-700 px-1 text-[0.65rem] font-bold leading-none text-white ring-2 ring-base-100"
      >
        {{ counterLabel }}
      </span>
    </summary>

    <div class="dropdown-content z-[70] mt-2 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-2xl">
      <header class="flex items-center justify-between gap-3 border-b border-base-200 bg-gradient-to-r from-violet-950 to-slate-900 px-4 py-3 text-white">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
            <Icon name="lucide:list-checks" class="h-4 w-4 text-violet-200" />
          </span>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-bold">My Tasks</h2>
              <span v-if="tasks.length" class="badge badge-sm border-0 bg-violet-200 text-violet-950">{{ tasks.length }}</span>
            </div>
            <p class="mt-0.5 text-xs text-violet-100/65">Assigned actions awaiting you</p>
          </div>
        </div>
        <button type="button" class="btn btn-ghost btn-circle btn-sm text-white hover:bg-white/10" :disabled="loading" title="Refresh tasks" @click="loadTasks">
          <span v-if="loading" class="loading loading-spinner loading-xs" />
          <Icon v-else name="lucide:refresh-cw" class="h-4 w-4" />
        </button>
      </header>

      <div v-if="loading && !loaded" class="grid min-h-40 place-items-center">
        <span class="loading loading-spinner loading-md text-violet-700" />
      </div>

      <div v-else-if="error" class="p-4">
        <div role="alert" class="alert alert-warning text-sm">
          <Icon name="lucide:triangle-alert" class="h-4 w-4" />
          <span class="flex-1">{{ error }}</span>
          <button type="button" class="btn btn-xs" @click="loadTasks">Retry</button>
        </div>
      </div>

      <div v-else-if="tasks.length" class="max-h-[28rem] divide-y divide-base-200 overflow-y-auto">
        <button
          v-for="task in tasks"
          :key="`${task.type}-${task.id}`"
          type="button"
          class="group flex w-full items-center gap-3 p-4 text-left transition hover:bg-violet-50/60"
          @click="openTask(task)"
        >
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-800">
            {{ initials(task.company_name) }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex items-center gap-2">
              <span class="truncate text-sm font-bold">{{ task.company_name }}</span>
              <span :class="['badge badge-sm shrink-0 border-0', ageClass(task)]">{{ ageLabel(task) }}</span>
            </span>
            <span class="mt-0.5 block truncate text-xs text-base-content/50">
              {{ task.title }} · {{ task.registration_number ?? 'No registration number' }} · {{ task.year }}
            </span>
            <span v-if="task.notes" class="mt-1 line-clamp-1 block text-xs text-base-content/65">{{ task.notes }}</span>
            <span class="mt-1 block text-[0.68rem] text-base-content/40">Assigned by {{ fullName(task.assigned_by) }}</span>
          </span>
          <Icon name="lucide:arrow-up-right" class="h-4 w-4 shrink-0 text-base-content/20 group-hover:text-violet-700" />
        </button>
      </div>

      <div v-else class="flex min-h-44 flex-col items-center justify-center p-6 text-center">
        <span class="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Icon name="lucide:circle-check-big" class="h-6 w-6" /></span>
        <p class="mt-3 text-sm font-bold">You are all caught up</p>
        <p class="mt-1 text-xs text-base-content/45">New assignments will appear here.</p>
      </div>
    </div>
  </details>
</template>

<script setup>
const { getMyTasks } = useMyTaskHelper()
const { user } = useSanctumAuth()
const dropdown = ref(null)
const tasks = ref([])
const loading = ref(false)
const loaded = ref(false)
const error = ref(null)
const clock = ref(Date.now())
let refreshTimer = null
let clockTimer = null

const currentUserId = computed(() => user.value?.data?.user?.id ?? null)
const counterLabel = computed(() => tasks.value.length > 99 ? '99+' : tasks.value.length)

async function loadTasks() {
  loading.value = true
  error.value = null
  const result = await getMyTasks()
  if (result.ok) {
    tasks.value = result.data
    loaded.value = true
  } else {
    error.value = result.error
  }
  loading.value = false
}

function handleOpen(event) {
  if (!event.currentTarget.parentElement.open || !loaded.value) loadTasks()
}

async function openTask(task) {
  dropdown.value?.removeAttribute('open')
  await navigateTo(task.url)
}

function resetForUser() {
  dropdown.value?.removeAttribute('open')
  tasks.value = []
  loaded.value = false
  error.value = null
}

function initials(name) {
  return String(name || 'T').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()
}

function fullName(userRecord) {
  return [userRecord?.name, userRecord?.lastname].filter(Boolean).join(' ') || 'System'
}

function ageSeconds(task) {
  if (task.assigned_at) return Math.max(0, Math.floor((clock.value - new Date(task.assigned_at).getTime()) / 1000))
  return Number(task.age_seconds || 0)
}

function ageLabel(task) {
  const seconds = ageSeconds(task)
  if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

function ageClass(task) {
  const hours = ageSeconds(task) / 3600
  if (hours >= 72) return 'bg-red-200 text-red-900'
  if (hours >= 24) return 'bg-amber-200 text-amber-900'
  return 'bg-emerald-200 text-emerald-900'
}

watch(currentUserId, (userId, previousUserId) => {
  if (userId === previousUserId) return
  resetForUser()
  if (userId) loadTasks()
})

onMounted(() => {
  loadTasks()
  refreshTimer = setInterval(loadTasks, 60000)
  clockTimer = setInterval(() => { clock.value = Date.now() }, 60000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  if (clockTimer) clearInterval(clockTimer)
})
</script>
