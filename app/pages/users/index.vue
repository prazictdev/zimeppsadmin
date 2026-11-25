<template>
  <div>
    <div class="card card-border card-xs">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Users</li>
          </ul>
        </div>
      </div>
    </div>

    <Users
      :users="userStore.users"
      :loading="userStore.loading"
      :account-options="userStore.accountOptions"
      :role-options="userStore.roleOptions"
      :options-loading="userStore.optionsLoading"
      :can-add="canAdd"
      :can-edit="canEdit"
      :can-delete="canDelete"
      @search="handleSearch"
      @page-change="userStore.fetchUsers"
      @search-accounts="userStore.loadAccountOptions"
      @load-user="loadUser"
      @create="createUser"
      @update="updateUser"
      @sync-roles="syncRoles"
      @unlock="unlockUser"
      @delete="deleteUser"
      @reset-password="userStore.sendPasswordReset"
    />
    <Loader :loading="userStore.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'System users' });

const userStore = useUserStore();
const { canAccess, canAdd, canEdit, canDelete, guardPage } = useCheckPermission('users');

const handleSearch = async (search) => {
  userStore.search = search;
  await userStore.fetchUsers(1);
};

const loadUser = async (id, resolve) => resolve(await userStore.findOne(id));
const createUser = async (payload, resolve) => resolve(await userStore.create(payload));
const updateUser = async (id, payload, resolve) => resolve(await userStore.update(id, payload));
const syncRoles = async (user, roleIds, resolve) => resolve(await userStore.syncRoles(user, roleIds));
const unlockUser = async (id, resolve) => resolve(await userStore.unlock(id));
const deleteUser = async (id, resolve) => resolve(await userStore.remove(id));

onMounted(async () => {
  if (!canAccess.value || !(await guardPage())) return;
  await Promise.all([
    userStore.fetchUsers(),
    userStore.loadAccountOptions(),
    userStore.loadRoleOptions(),
  ]);
});
</script>
