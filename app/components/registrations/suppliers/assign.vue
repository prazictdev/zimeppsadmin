<template>
  <div>
    <button :class="['btn btn-primary btn-xs shrink-0', compact ? 'btn-square' : '']" :title="compact ? (company.assignment ? 'Reassign application' : 'Assign application') : undefined" @click="openModal">
      <Icon :name="company.assignment ? 'lucide:refresh-cw' : 'lucide:user-plus'" class="h-3.5 w-3.5" />
      <span v-if="!compact">{{ company.assignment ? 'Reassign' : 'Assign' }}</span>
    </button>

    <dialog :id="dialogId" class="modal">
      <div class="modal-box max-w-xl text-left">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-wide text-primary">Accountability assignment</p>
            <h3 class="mt-1 text-lg font-bold">{{ company.company_name }}</h3>
            <p class="text-sm text-base-content/55">Choose the officer responsible for actioning this {{ year }} application.</p>
          </div>
          <button type="button" class="btn btn-ghost btn-circle btn-sm" @click="closeModal"><Icon name="lucide:x" /></button>
        </div>

        <div v-if="company.assignment?.assigned_user" class="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
          Currently assigned to <strong>{{ fullName(company.assignment.assigned_user) }}</strong>.
        </div>

        <div class="mt-4 space-y-3">
          <label class="input input-bordered input-sm flex w-full items-center gap-2">
            <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
            <input v-model.trim="searchTerm" type="search" class="grow" placeholder="Search actioning officers by name or email" @input="onSearchInput" />
          </label>

          <textarea v-model.trim="notes" class="textarea textarea-bordered w-full" rows="2" maxlength="500" placeholder="Assignment note (optional)" />

          <div v-if="store.actioningUsersLoading" class="flex justify-center py-8"><span class="loading loading-spinner loading-md" /></div>
          <ul v-else class="max-h-72 divide-y divide-base-200 overflow-y-auto rounded-lg border border-base-200">
            <li v-if="!store.actioningUsers.length" class="px-4 py-8 text-center text-sm text-base-content/45">No eligible actioning officers found.</li>
            <li v-for="user in store.actioningUsers" :key="user.id" class="flex items-center justify-between gap-3 px-3 py-3 hover:bg-base-200/50">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold">{{ fullName(user) }}</p>
                <p class="truncate text-xs text-base-content/50">{{ user.email }}</p>
              </div>
              <button type="button" class="btn btn-success btn-xs" :disabled="saving !== null || company.assignment?.assigned_user?.id === user.id" @click="select(user)">
                <span v-if="saving === user.id" class="loading loading-spinner loading-xs" />
                <Icon v-else name="lucide:check" class="h-3.5 w-3.5" />
                {{ company.assignment?.assigned_user?.id === user.id ? 'Current' : 'Assign' }}
              </button>
            </li>
          </ul>
        </div>

        <div class="modal-action"><button type="button" class="btn btn-sm" @click="closeModal">Cancel</button></div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>close</button></form>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  company: { type: Object, required: true },
  year: { type: Number, required: true },
  compact: { type: Boolean, default: false },
})

const store = useRegistrationStore()
const dialogId = computed(() => `assign_supplier_registration_${props.company.company_id}_${props.year}`)
const searchTerm = ref('')
const notes = ref('')
const saving = ref(null)
let searchTimer = null

function fullName(user) {
  return [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || 'Unknown user'
}

async function openModal() {
  searchTerm.value = ''
  notes.value = ''
  document.getElementById(dialogId.value)?.showModal()
  await store.fetchActioningUsers()
}

function closeModal() {
  document.getElementById(dialogId.value)?.close()
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.fetchActioningUsers(searchTerm.value), 300)
}

async function select(user) {
  saving.value = user.id
  const ok = await store.assignActioningOfficer(props.company.company_id, {
    user_id: user.id,
    year: props.year,
    notes: notes.value || null,
  })
  saving.value = null
  if (ok) closeModal()
}

onUnmounted(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>
