<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div class="breadcrumbs text-sm text-base-content/55"><ul><li>System configuration</li><li>Feedback sessions</li></ul></div>
        <h1 class="mt-2 text-2xl font-bold">User testing feedback</h1>
        <p class="mt-1 max-w-2xl text-sm text-base-content/60">Create focused testing rounds, assign them to a portal and audience, and review responses in one place.</p>
      </div>
      <NuxtLink v-if="canAdd" to="/feedback-sessions/new" class="btn btn-primary"><Icon name="lucide:plus" />Create session</NuxtLink>
    </header>

    <div v-if="!canAccess" role="alert" class="alert alert-warning"><Icon name="lucide:shield-alert" /><span>You do not have permission to view feedback sessions.</span></div>
    <template v-else>
      <section class="card card-border bg-base-100"><div class="card-body grid gap-3 md:grid-cols-[1fr_13rem_13rem_auto]">
        <label class="input w-full"><Icon name="lucide:search" class="text-base-content/45" /><input v-model.trim="filters.search" placeholder="Search sessions" @keyup.enter="load" /></label>
        <select v-model="filters.portal" class="select w-full"><option value="">All portals</option><option v-for="portal in portals" :key="portal" :value="portal">{{ label(portal) }}</option></select>
        <select v-model="filters.status" class="select w-full"><option value="">All statuses</option><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="CLOSED">Closed</option></select>
        <button class="btn" @click="load">Apply filters</button>
      </div></section>

      <div v-if="loading" class="flex justify-center py-16"><span class="loading loading-spinner loading-lg" /></div>
      <div v-else-if="error" role="alert" class="alert alert-error"><Icon name="lucide:circle-alert" /><span>{{ error }}</span><button class="btn btn-sm" @click="load">Try again</button></div>
      <div v-else-if="!sessions.length" class="card card-border bg-base-100"><div class="card-body items-center py-16 text-center"><Icon name="lucide:clipboard-list" class="h-10 w-10 text-base-content/30" /><h2 class="card-title mt-2">No feedback sessions found</h2><p class="text-base-content/55">Create a session to start a structured user test.</p></div></div>
      <div v-else class="overflow-x-auto rounded-box border border-base-300 bg-base-100">
        <table class="table">
          <thead><tr><th>Session</th><th>Portal</th><th>Window</th><th>Content</th><th>Responses</th><th>Status</th><th class="text-right">Actions</th></tr></thead>
          <tbody><tr v-for="session in sessions" :key="session.uuid">
            <td><p class="font-semibold">{{ session.title }}</p><p class="mt-1 max-w-md truncate text-xs text-base-content/50">{{ session.description || 'No description' }}</p></td>
            <td><span class="badge badge-outline">{{ label(session.portal) }}</span></td>
            <td class="text-sm"><p>{{ date(session.opens_at) || 'Immediately' }}</p><p class="text-base-content/45">to {{ date(session.closes_at) || 'no deadline' }}</p></td>
            <td class="text-sm">{{ session.scenarios_count }} scenarios · {{ session.questions_count }} questions</td>
            <td><span class="font-semibold">{{ session.submitted_count }}</span></td>
            <td><span class="badge" :class="statusClass(session.status)">{{ label(session.status) }}</span></td>
            <td><div class="flex justify-end gap-1">
              <NuxtLink :to="`/feedback-sessions/${session.uuid}/responses`" class="btn btn-ghost btn-sm" title="View responses"><Icon name="lucide:bar-chart-3" /></NuxtLink>
              <NuxtLink :to="`/feedback-sessions/${session.uuid}`" class="btn btn-ghost btn-sm" :title="session.status === 'DRAFT' ? 'Edit' : 'View'"><Icon :name="session.status === 'DRAFT' ? 'lucide:pencil' : 'lucide:eye'" /></NuxtLink>
              <button v-if="session.status === 'DRAFT' && canEdit" class="btn btn-success btn-sm" @click="changeStatus(session, 'publish')">Publish</button>
              <button v-if="session.status === 'PUBLISHED' && canEdit" class="btn btn-outline btn-sm" @click="changeStatus(session, 'close')">Close</button>
            </div></td>
          </tr></tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', sanctum: { authOnly: true } })
useHead({ title: 'Feedback sessions' })
const { canAccess, canAdd, canEdit } = useCheckPermission('feedbacksessions')
const api = useFeedbackSessionHelper()
const filters = reactive({ search: '', portal: '', status: '' })
const sessions = ref([])
const portals = ['SUPPLIER', 'PROCUREMENT_ENTITY', 'ADMIN', 'MOBILE']
const loading = ref(false)
const error = ref('')
const label = value => String(value || '').toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
const date = value => value ? new Intl.DateTimeFormat('en-ZW', { dateStyle: 'medium' }).format(new Date(value)) : ''
const statusClass = status => ({ DRAFT: 'badge-ghost', PUBLISHED: 'badge-success', CLOSED: 'badge-neutral' }[status] || 'badge-ghost')

async function load() {
  if (!canAccess.value) return
  loading.value = true; error.value = ''
  try { sessions.value = (await api.list({ ...filters, perPage: 100 }))?.data?.data ?? [] }
  catch (exception) { error.value = exception?.data?.message || 'Feedback sessions could not be loaded.' }
  finally { loading.value = false }
}
async function changeStatus(session, action) {
  if (!confirm(`${label(action)} “${session.title}”?`)) return
  try { await api[action](session.uuid); await load() }
  catch (exception) { error.value = exception?.data?.message || `The session could not be ${action}ed.` }
}
onMounted(load)
</script>
