<template>
  <section class="space-y-4">
    <header class="card border border-base-300 bg-base-100">
      <div class="card-body gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-widest text-base-content/50">Administration</p>
          <h1 class="card-title mt-1 text-2xl">Training environment</h1>
          <p class="mt-1 max-w-2xl text-sm text-base-content/60">
            Generate time-limited procurement-entity accounts for facilitated training sessions.
          </p>
        </div>
        <TrainingSessionsAdd v-if="canAdd" />
      </div>
    </header>

    <div class="stats stats-vertical w-full border border-base-300 bg-base-100 sm:stats-horizontal">
      <div class="stat">
        <div class="stat-title">Sessions</div>
        <div class="stat-value text-2xl">{{ store.sessions.length }}</div>
        <div class="stat-desc">All generated training cohorts</div>
      </div>
      <div class="stat">
        <div class="stat-title">Currently valid</div>
        <div class="stat-value text-2xl">{{ activeCount }}</div>
        <div class="stat-desc">Sessions that have not expired</div>
      </div>
      <div class="stat">
        <div class="stat-title">Test users</div>
        <div class="stat-value text-2xl">{{ totalUsers }}</div>
        <div class="stat-desc">Activated procurement-entity users</div>
      </div>
    </div>

    <div class="card border border-base-300 bg-base-100">
      <div class="card-body p-0">
        <div class="flex flex-col gap-3 border-b border-base-300 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="font-bold">Training sessions</h2>
            <p class="text-xs text-base-content/50">Generated accounts remain associated with their session.</p>
          </div>
          <label class="input input-sm w-full sm:w-72">
            <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
            <input v-model.trim="search" type="search" class="grow" placeholder="Search sessions" />
          </label>
        </div>

        <div v-if="store.loading" class="flex min-h-48 items-center justify-center">
          <span class="loading loading-spinner loading-lg" aria-label="Loading training sessions"></span>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Test users</th>
                <th>Created</th>
                <th>Valid until</th>
                <th>Status</th>
                <th><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="session in filteredSessions" :key="session.uuid || session.id">
                <td>
                  <p class="font-semibold">{{ session.session_name }}</p>
                  <p class="font-mono text-xs text-base-content/40">{{ session.uuid }}</p>
                </td>
                <td>{{ userCount(session) }}</td>
                <td>{{ formatDate(session.created_at) }}</td>
                <td>{{ formatDate(session.expires_at || session.valid_until) }}</td>
                <td>
                  <span class="badge badge-sm" :class="isActive(session) ? 'badge-success badge-soft' : 'badge-ghost'">
                    {{ isActive(session) ? 'Active' : 'Expired' }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-1">
                    <button class="btn btn-ghost btn-sm" type="button" @click="showDetails(session)">
                      <Icon name="lucide:eye" /> View
                    </button>
                    <button v-if="canDelete && isActive(session)" class="btn btn-ghost btn-sm text-error" type="button" @click="deactivate(session)">
                      <Icon name="lucide:user-x" /> Deactivate
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredSessions.length">
                <td colspan="6" class="py-12 text-center text-sm text-base-content/45">
                  {{ search ? 'No sessions match your search.' : 'No training sessions have been generated yet.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <dialog ref="detailsDialog" class="modal">
      <div class="modal-box max-w-4xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold">{{ selected?.session_name }}</h2>
            <p class="mt-1 text-sm text-base-content/55">Generated procurement entities and their activated users.</p>
          </div>
          <form method="dialog"><button class="btn btn-circle btn-ghost" aria-label="Close"><Icon name="lucide:x" /></button></form>
        </div>
        <div v-if="detailsLoading" class="flex min-h-40 items-center justify-center"><span class="loading loading-spinner loading-lg"></span></div>
        <div v-else class="mt-5 overflow-x-auto rounded-box border border-base-300">
          <table class="table table-sm">
            <thead><tr><th>Procurement entity</th><th>User</th><th>Activation</th><th><span class="sr-only">Actions</span></th></tr></thead>
            <tbody>
              <tr v-for="account in accounts" :key="account.id || account.uuid || account.email">
                <td>{{ account.company_name || account.company?.name || '—' }}</td>
                <td><p>{{ account.user_name || fullName(account.user) }}</p><p class="text-xs text-base-content/45">{{ account.email || account.user?.email }}</p></td>
                <td><span class="badge badge-success badge-soft badge-sm">Activated</span></td>
                <td class="text-right">
                  <button
                    v-if="canEdit && isActive(selected)"
                    class="btn btn-ghost btn-xs"
                    type="button"
                    :disabled="resettingAccountId === account.id"
                    title="Reset this demo user's password to password"
                    @click="resetPassword(account)"
                  >
                    <span v-if="resettingAccountId === account.id" class="loading loading-spinner loading-xs" />
                    <Icon v-else name="lucide:key-round" class="h-3.5 w-3.5" />
                    Reset password
                  </button>
                </td>
              </tr>
              <tr v-if="!accounts.length"><td colspan="4" class="py-8 text-center text-base-content/45">No account details were returned.</td></tr>
            </tbody>
          </table>
        </div>
        <div class="modal-action"><form method="dialog"><button class="btn">Close</button></form></div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Close</button></form>
    </dialog>
  </section>
</template>

<script setup>
const props = defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useTrainingSessionStore();
const search = ref('');
const selected = ref(null);
const details = ref(null);
const detailsLoading = ref(false);
const resettingAccountId = ref(null);
const detailsDialog = ref(null);

const filteredSessions = computed(() => {
  const needle = search.value.toLowerCase();
  if (!needle) return store.sessions;
  return store.sessions.filter((session) => session.session_name?.toLowerCase().includes(needle));
});
const activeCount = computed(() => store.sessions.filter(isActive).length);
const totalUsers = computed(() => store.sessions.reduce((total, session) => total + userCount(session), 0));
const accounts = computed(() => details.value?.accounts || details.value?.training_accounts || details.value?.users || []);

function expiry(session) {
  return session.expires_at || session.valid_until;
}
function isActive(session) {
  const status = session.effective_status || session.status;
  return status === 'ACTIVE' && Boolean(expiry(session)) && new Date(expiry(session)).getTime() > Date.now();
}
function userCount(session) {
  return Number(session.number_of_users ?? session.accounts_count ?? session.training_accounts_count ?? session.users_count ?? 0);
}
function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-ZW', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
function fullName(user) {
  if (!user) return '—';
  return [user.name || user.firstname || user.first_name, user.lastname || user.surname || user.last_name].filter(Boolean).join(' ') || 'Training user';
}
async function showDetails(session) {
  selected.value = session;
  details.value = session;
  detailsDialog.value?.showModal();
  detailsLoading.value = true;
  details.value = await store.findOne(session.uuid || session.id) || session;
  detailsLoading.value = false;
}
async function deactivate(session) {
  if (!props.canDelete) return;
  const confirmed = window.confirm(`Deactivate "${session.session_name}" and prevent all generated users from signing in?`);
  if (!confirmed) return;
  await store.deactivate(session.uuid || session.id);
}
async function resetPassword(account) {
  if (!props.canEdit || !selected.value || !isActive(selected.value)) return;
  const email = account.email || account.user?.email || 'this training user';
  const confirmed = window.confirm(`Reset ${email}'s password to "password"? Their temporary login lock will also be cleared.`);
  if (!confirmed) return;

  resettingAccountId.value = account.id;
  const success = await store.resetPassword(selected.value.uuid || selected.value.id, account.id);
  resettingAccountId.value = null;
  if (success) details.value = await store.findOne(selected.value.uuid || selected.value.id) || details.value;
}
</script>
