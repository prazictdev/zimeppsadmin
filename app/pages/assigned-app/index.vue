<template>
  <section class="space-y-5">
    <div class="breadcrumbs text-sm">
      <ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Assigned APP</li></ul>
    </div>

    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold">Assigned APP</h1>
        <p class="mt-1 text-sm text-base-content/60">Annual procurement plans assigned to you and waiting for your action.</p>
      </div>
      <button v-if="canAccess" class="btn btn-outline btn-sm" :disabled="loading" @click="load(meta.current_page)">
        <Icon name="lucide:refresh-cw" /> Refresh
      </button>
    </header>

    <div v-if="!canAccess" class="alert alert-warning" role="alert">
      <Icon name="lucide:lock" /><span>You do not have permission to view assigned APP applications.</span>
    </div>

    <template v-else>
      <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="search">
        <label class="input w-full sm:max-w-md">
          <Icon name="lucide:search" />
          <input v-model.trim="searchInput" type="search" placeholder="Search entity or registration number" aria-label="Search assigned applications" />
        </label>
        <button class="btn btn-neutral" :disabled="loading" type="submit">Search</button>
      </form>

      <div v-if="error" class="alert alert-error" role="alert">
        <Icon name="lucide:triangle-alert" /><span>{{ error }}</span>
        <button class="btn btn-sm" @click="load(meta.current_page)">Retry</button>
      </div>
      <div v-else-if="loading" class="flex justify-center gap-3 p-12" role="status">
        <span class="loading loading-spinner loading-sm" /> Loading assigned applications…
      </div>
      <div v-else-if="!plans.length" class="rounded-xl border border-dashed border-base-300 p-12 text-center">
        <Icon name="lucide:inbox" class="mx-auto h-9 w-9 text-base-content/40" />
        <h2 class="mt-3 font-semibold">{{ appliedSearch ? 'No matching applications' : 'No APP applications awaiting your action' }}</h2>
        <p class="mt-1 text-sm text-base-content/60">{{ appliedSearch ? 'Try another entity name or registration number.' : 'Applications will appear here when they are assigned to you for action.' }}</p>
      </div>
      <div v-else class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
        <div class="border-b border-base-200 px-4 py-3 text-sm text-base-content/60" aria-live="polite">{{ meta.total }} application{{ meta.total === 1 ? '' : 's' }} awaiting your action</div>
        <div class="overflow-x-auto">
          <table class="table">
            <thead><tr><th>Procurement entity</th><th>Plan year</th><th>Action required</th><th>Last updated</th><th><span class="sr-only">Open application</span></th></tr></thead>
            <tbody>
              <tr v-for="plan in plans" :key="plan.uuid">
                <td><p class="font-semibold">{{ plan.company?.name || '—' }}</p><p class="text-xs text-base-content/60">{{ plan.company?.regnumber || '—' }}</p></td>
                <td>{{ plan.year }}</td>
                <td><span class="badge badge-outline whitespace-nowrap">{{ actionLabel(plan.status) }}</span></td>
                <td class="whitespace-nowrap">{{ formatDate(plan.updated_at) }}</td>
                <td><NuxtLink :to="`/admin-plan-dashboard/plans/${plan.uuid}`" class="btn btn-neutral btn-sm whitespace-nowrap" :aria-label="`Action ${plan.company?.name || 'procurement'} plan for ${plan.year}`">Action plan <Icon name="lucide:arrow-up-right" /></NuxtLink></td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer v-if="meta.last_page > 1" class="flex items-center justify-between border-t border-base-200 p-3">
          <button class="btn btn-ghost btn-sm" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)">Previous</button>
          <span class="text-sm">Page {{ meta.current_page }} of {{ meta.last_page }}</span>
          <button class="btn btn-ghost btn-sm" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)">Next</button>
        </footer>
      </div>
    </template>
  </section>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Assigned APP' })

const { canAccess } = useCheckPermission('assignedapp')
const { fetchAssignedApps } = useAssignedAppHelper()
const plans = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(false)
const error = ref('')
const searchInput = ref('')
const appliedSearch = ref('')
let requestId = 0

async function load(page = 1) {
  if (!canAccess.value) return
  const currentRequest = ++requestId
  loading.value = true
  error.value = ''
  const result = await fetchAssignedApps({ page, per_page: 25, search: appliedSearch.value || undefined })
  if (currentRequest !== requestId) return
  if (result.ok) {
    const payload = result.data?.data ?? {}
    plans.value = payload.data ?? []
    meta.value = { current_page: payload.current_page ?? 1, last_page: payload.last_page ?? 1, total: payload.total ?? 0 }
  } else {
    error.value = 'Unable to load your assigned applications. Please try again.'
  }
  loading.value = false
}

function search() {
  appliedSearch.value = searchInput.value
  load(1)
}

function actionLabel(status) {
  return {
    PENDING_ADMIN_AUTHORIZATION: 'Review and recommend',
    PENDING_MANAGER_REVIEW: 'Review recommendation',
    PENDING_APPROVER_DECISION: 'Make approval decision',
  }[status] ?? status
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

watch(canAccess, allowed => {
  if (allowed) load(1)
  else {
    requestId++
    plans.value = []
    loading.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => { requestId++ })
</script>
