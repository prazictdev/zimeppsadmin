<template>
  <section class="card card-border mt-4 bg-base-100">
    <div class="card-body gap-5">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="card-title">System users</h1>
          <p class="text-sm text-base-content/60">Manage user profiles, companies, roles, and password recovery.</p>
        </div>
        <button v-if="canAdd" class="btn btn-primary" @click="openCreate">
          <Icon name="lucide:user-plus" class="h-4 w-4" />
          Add user
        </button>
      </div>

      <label class="input w-full sm:max-w-md">
        <Icon name="lucide:search" class="h-4 w-4 opacity-50" />
        <input v-model.trim="searchValue" type="search" placeholder="Search users or companies" @input="queueSearch" />
      </label>

      <div class="overflow-x-auto rounded-box border border-base-200">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Company</th>
              <th>Roles</th>
              <th><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users?.data ?? []" :key="user.id">
              <td>
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs font-bold">
                    {{ initials(user) }}
                  </div>
                  <div>
                    <p class="font-semibold">{{ fullName(user) }}</p>
                    <p class="text-xs text-base-content/50">ID {{ user.id }}</p>
                  </div>
                </div>
              </td>
              <td>
                <p class="text-sm">{{ user.email }}</p>
                <p class="text-xs text-base-content/60">{{ user.phone || 'No phone number' }}</p>
              </td>
              <td class="min-w-64">
                <span v-if="user.companies?.[0]" class="badge badge-ghost badge-sm" :title="user.companies[0].regnumber">
                  {{ user.companies[0].name }}
                </span>
                <span v-else class="text-sm text-base-content/40">No company</span>
              </td>
              <td class="min-w-48">
                <div v-if="user.roles?.length" class="flex flex-wrap gap-1.5">
                  <span v-for="role in user.roles" :key="role.id" class="badge badge-outline badge-sm">{{ role.name }}</span>
                </div>
                <span v-else class="text-sm text-base-content/40">No role assigned</span>
              </td>
              <td>
                <div class="flex justify-end gap-1">
                  <button v-if="canEdit" class="btn btn-ghost btn-sm" title="Edit user" @click="openEdit(user)">
                    <Icon name="lucide:pencil" class="h-4 w-4" />
                  </button>
                  <button v-if="canEdit" class="btn btn-ghost btn-sm" title="Manage roles" @click="openAccess(user)">
                    <Icon name="lucide:key-round" class="h-4 w-4" />
                  </button>
                  <button v-if="canEdit" class="btn btn-ghost btn-sm" title="Send password reset" @click="requestPasswordReset(user)">
                    <Icon name="lucide:mail-key" class="h-4 w-4" />
                  </button>
                  <button v-if="canDelete && !isCurrentUser(user)" class="btn btn-ghost btn-sm text-error" title="Remove user" @click="openDelete(user)">
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!loading && !(users?.data?.length)">
              <td colspan="5" class="py-12 text-center text-base-content/50">
                <Icon name="lucide:users" class="mx-auto mb-2 h-8 w-8" />
                No system users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="users" class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-base-content/60">Showing {{ users.from ?? 0 }}–{{ users.to ?? 0 }} of {{ users.total ?? 0 }}</p>
        <div class="flex items-center justify-end gap-2">
          <button class="btn btn-sm" :disabled="loading || users.current_page <= 1" @click="$emit('page-change', users.current_page - 1)">Previous</button>
          <span class="text-sm">Page {{ users.current_page ?? 1 }} of {{ users.last_page ?? 1 }}</span>
          <button class="btn btn-sm" :disabled="loading || users.current_page >= users.last_page" @click="$emit('page-change', users.current_page + 1)">Next</button>
        </div>
      </div>
    </div>

    <dialog ref="userDialog" class="modal">
      <div class="modal-box max-w-3xl">
        <div class="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-bold">{{ editingUser ? 'Edit system user' : 'Add system user' }}</h2>
            <p class="text-sm text-base-content/60">{{ editingUser ? 'Update profile details and company.' : 'A temporary password will be emailed to the new user.' }}</p>
          </div>
          <button class="btn btn-circle btn-ghost btn-sm" aria-label="Close" @click="closeUserDialog"><Icon name="lucide:x" /></button>
        </div>
        <UsersForm
          :user="editingUser"
          :accounts="availableAccounts"
          :accounts-loading="optionsLoading"
          :submitting="submitting"
          :mode="editingUser ? 'edit' : 'create'"
          @submit="saveUser"
          @cancel="closeUserDialog"
          @search-accounts="$emit('search-accounts', $event)"
        />
      </div>
      <form method="dialog" class="modal-backdrop"><button>Close</button></form>
    </dialog>

    <dialog ref="accessDialog" class="modal">
      <div class="modal-box">
        <h2 class="text-xl font-bold">Manage user roles</h2>
        <p class="mt-1 text-sm text-base-content/60">Regulator roles assigned to {{ fullName(selectedUser) }}.</p>
        <div class="mt-4 space-y-2">
          <label v-for="role in roleOptions" :key="role.id" class="flex cursor-pointer items-center gap-3 rounded-selector border border-base-200 px-3 py-3">
            <input v-model="selectedRoleIds" type="checkbox" class="checkbox checkbox-sm" :value="role.id" />
            <span class="font-medium">{{ role.name }}</span>
          </label>
          <p v-if="roleOptions.length === 0" class="py-6 text-center text-sm text-base-content/50">No Regulator roles are configured.</p>
        </div>
        <div class="modal-action">
          <button class="btn" @click="accessDialog.close()">Cancel</button>
          <button class="btn btn-primary" :disabled="submitting" @click="saveRoles">
            <span v-if="submitting" class="loading loading-spinner loading-xs" /> Save roles
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Close</button></form>
    </dialog>

    <dialog ref="deleteDialog" class="modal">
      <div class="modal-box">
        <div class="flex items-start gap-3">
          <div class="rounded-full bg-error/10 p-2 text-error"><Icon name="lucide:triangle-alert" class="h-5 w-5" /></div>
          <div>
            <h2 class="text-xl font-bold">Remove system user?</h2>
            <p class="mt-1 text-sm text-base-content/70">You are about to remove access for <strong>{{ fullName(selectedUser) }}</strong>.</p>
          </div>
        </div>
        <div role="alert" class="alert alert-warning mt-4 items-start">
          <Icon name="lucide:info" class="h-5 w-5" />
          <span class="text-sm">Users with transaction history are deactivated and retained for audit purposes. Users without transaction history are permanently deleted. You cannot remove your own account.</span>
        </div>
        <div class="modal-action">
          <button class="btn" @click="deleteDialog.close()">Cancel</button>
          <button class="btn btn-error" :disabled="submitting" @click="confirmDelete">
            <span v-if="submitting" class="loading loading-spinner loading-xs" /> Remove user
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Close</button></form>
    </dialog>
  </section>
</template>

<script setup>
const props = defineProps({
  users: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  accountOptions: { type: Array, default: () => [] },
  roleOptions: { type: Array, default: () => [] },
  optionsLoading: { type: Boolean, default: false },
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const emit = defineEmits(['search', 'page-change', 'search-accounts', 'create', 'update', 'sync-roles', 'delete', 'reset-password', 'load-user']);
const { user: authenticatedUser } = useSanctumAuth();
const currentUserId = computed(() => authenticatedUser.value?.data?.user?.id ?? null);
const userDialog = ref(null);
const accessDialog = ref(null);
const deleteDialog = ref(null);
const editingUser = ref(null);
const selectedUser = ref(null);
const selectedRoleIds = ref([]);
const submitting = ref(false);
const searchValue = ref('');
let searchTimer;

const availableAccounts = computed(() => {
  const accounts = [...props.accountOptions];
  for (const account of editingUser.value?.companies ?? []) {
    if (!accounts.some(option => option.id === account.id)) accounts.unshift(account);
  }
  return accounts;
});

const fullName = user => [user?.name, user?.middlename, user?.lastname].filter(Boolean).join(' ') || 'Unknown user';
const initials = user => `${user?.name?.[0] ?? ''}${user?.lastname?.[0] ?? ''}`.toUpperCase() || 'U';
const isCurrentUser = user => Number(user?.id) === Number(currentUserId.value);

const queueSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => emit('search', searchValue.value), 400);
};

const openCreate = () => {
  editingUser.value = null;
  emit('search-accounts', '');
  userDialog.value.showModal();
};

const openEdit = async (user) => {
  editingUser.value = await new Promise(resolve => emit('load-user', user.id, resolve));
  if (!editingUser.value) return;
  emit('search-accounts', '');
  userDialog.value.showModal();
};

const closeUserDialog = () => userDialog.value?.close();

const saveUser = async (payload) => {
  submitting.value = true;
  const success = await new Promise(resolve => {
    if (editingUser.value) emit('update', editingUser.value.id, payload, resolve);
    else emit('create', payload, resolve);
  });
  submitting.value = false;
  if (success) closeUserDialog();
};

const openAccess = (user) => {
  selectedUser.value = user;
  selectedRoleIds.value = (user.roles ?? []).map(role => role.id);
  accessDialog.value.showModal();
};

const saveRoles = async () => {
  submitting.value = true;
  const success = await new Promise(resolve => emit('sync-roles', selectedUser.value, selectedRoleIds.value, resolve));
  submitting.value = false;
  if (success) accessDialog.value.close();
};

const requestPasswordReset = user => emit('reset-password', user.email);
const openDelete = (user) => {
  selectedUser.value = user;
  deleteDialog.value.showModal();
};

const confirmDelete = async () => {
  submitting.value = true;
  const success = await new Promise(resolve => emit('delete', selectedUser.value.id, resolve));
  submitting.value = false;
  if (success) deleteDialog.value.close();
};
</script>
