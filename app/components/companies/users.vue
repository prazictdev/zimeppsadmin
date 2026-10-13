<template>
  <section v-if="can('can.access.users')" class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
    <header class="flex flex-col gap-3 border-b border-base-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p class="text-xs font-semibold uppercase tracking-wide text-base-content/40">Access administration</p><h2 class="mt-0.5 font-bold">Customer users</h2><p class="text-xs text-base-content/45">People authorised to access this customer account.</p></div>
      <div class="flex gap-2">
        <label class="input input-sm w-56 border-base-300"><Icon name="lucide:search" class="h-4 w-4 text-base-content/40" /><input v-model.trim="search" type="search" class="grow" placeholder="Search users" /></label>
        <AdminuserAdd v-if="can('can.add.users')" :company="company" @refreshcompany="handleRefreshCompany" />
      </div>
    </header>

    <div v-if="filteredUsers.length" class="overflow-x-auto">
      <table class="table table-sm min-w-[50rem]">
        <thead><tr><th>User</th><th>Email</th><th>Gender</th><th>Status</th><th></th></tr></thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-base-200/30">
            <td><div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-base-200 text-xs font-bold">{{ initials(user) }}</span><span class="font-medium">{{ getUserFullName(user) }}</span></div></td>
            <td class="text-sm">{{ user.email }}</td>
            <td class="capitalize">{{ user.gender ?? '—' }}</td>
            <td><span :class="['badge badge-sm', user.status === 'active' ? 'badge-success' : 'badge-ghost']">{{ user.status ?? 'unknown' }}</span></td>
            <td><div class="flex justify-end gap-1"><AdminuserEdit v-if="can('can.edit.users')" :user="user" :company="company" @refreshcompany="handleRefreshCompany" /><AdminuserAccess v-if="can('can.edit.users')" :user="user" :company="company" @refreshuser="handleRefreshCompany" /><AdminuserDelete v-if="can('can.delete.users')" :user="user" @refreshcompany="handleRefreshCompany" /><AdminuserReset v-if="can('can.edit.users')" :user="user" @refreshcompany="handleRefreshCompany" /></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="flex min-h-36 flex-col items-center justify-center p-6 text-center"><Icon name="lucide:users" class="h-7 w-7 text-base-content/20" /><p class="mt-2 text-sm font-semibold">{{ search ? 'No matching users' : 'No customer users' }}</p><p class="mt-1 text-xs text-base-content/45">{{ search ? 'Try a different name or email address.' : 'Add a user to grant access to this customer account.' }}</p></div>
  </section>
</template>

<script setup>
const props = defineProps({
  company: { type: Object, required: true },
})

const emit = defineEmits(['refreshcompany'])
const search = ref('')
const { can } = useAbility()

const filteredUsers = computed(() => {
  const users = props.company?.users ?? []
  const needle = search.value.toLowerCase()
  if (!needle) return users
  return users.filter(user => `${getUserFullName(user)} ${user.email ?? ''}`.toLowerCase().includes(needle))
})

function getUserFullName(user) {
  return [user.name, user.middlename, user.lastname].filter(Boolean).join(' ') || 'Unnamed user'
}

function initials(user) {
  return [user.name, user.lastname].filter(Boolean).map(value => value.charAt(0).toUpperCase()).join('').slice(0, 2) || 'U'
}

function handleRefreshCompany() {
  emit('refreshcompany')
}
</script>
