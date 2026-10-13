<template>
  <div>
    <button class="btn btn-primary btn-xs" @click="openModal">
      <Icon name="lucide:user-plus" />
      {{ company.assigned_admin_user_id ? 'Reassign' : 'Assign' }}
    </button>

    <dialog :id="dialogId" class="modal">
      <div class="modal-box max-w-xl">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">Assign Handler — {{ company.name }}</h3>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="mt-3 space-y-3">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search admin staff by name or email..."
            class="input input-bordered input-sm w-full"
            @input="onSearchInput"
          />

          <div v-if="store.handlersLoading" class="flex justify-center py-6">
            <span class="loading loading-spinner loading-md"></span>
          </div>

          <ul v-else class="max-h-80 divide-y divide-base-200 overflow-y-auto rounded border border-base-200">
            <li v-if="!store.handlers.length" class="px-3 py-6 text-center text-sm text-base-content/50">
              No matching admin staff.
            </li>
            <li
              v-for="u in store.handlers"
              :key="u.id"
              class="flex items-center justify-between px-3 py-2 hover:bg-base-200/50"
            >
              <div>
                <p class="font-medium">{{ u.name }} {{ u.lastname || '' }}</p>
                <p class="text-xs text-base-content/60">{{ u.email }}</p>
              </div>
              <button
                class="btn btn-success btn-xs"
                :disabled="saving === u.id"
                @click="select(u)"
              >
                <span v-if="saving === u.id">Assigning...</span>
                <span v-else>
                  <Icon name="lucide:check" />
                  Select
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="modal-action">
          <button class="btn" type="button" @click="closeModal">Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  company: { type: Object, required: true },
});

const store = useProcurementEntityStore();
const dialogId = computed(() => `assign_pe_modal_${props.company.id}`);
const searchTerm = ref('');
const saving = ref(null);
let searchTimer = null;

const openModal = async () => {
  searchTerm.value = '';
  await store.fetchHandlers('');
  document.getElementById(dialogId.value).showModal();
};

const closeModal = () => document.getElementById(dialogId.value).close();

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => store.fetchHandlers(searchTerm.value), 300);
};

const select = async (user) => {
  saving.value = user.id;
  const ok = await store.assignHandler(props.company.id, user.id);
  saving.value = null;
  if (ok) closeModal();
};
</script>
