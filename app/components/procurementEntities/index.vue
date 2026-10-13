<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Procurement Entities</span>
        <div class="flex flex-wrap items-center gap-2">
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search by name or reg no..."
            class="input input-bordered input-sm w-64"
            @input="onSearchInput"
          />
          <select v-model="store.assignedFilter" class="select select-bordered select-sm" @change="reload">
            <option value="">All</option>
            <option value="yes">Assigned</option>
            <option value="no">Unassigned</option>
          </select>
        </div>
      </div>

      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="table table-zebra mt-3 w-full text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Reg No.</th>
              <th>Country</th>
              <th>Email</th>
              <th class="text-right">Users</th>
              <th>Assigned Handler</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.items.length">
              <td colspan="8" class="text-center text-base-content/50">No procurement entities match this filter.</td>
            </tr>
            <tr v-for="(c, i) in store.items" :key="c.id">
              <td>{{ rowNumber(i) }}</td>
              <td class="font-medium">{{ c.name }}</td>
              <td class="font-mono text-xs">{{ c.regnumber || '—' }}</td>
              <td>{{ c.country || '—' }}</td>
              <td>{{ c.email || '—' }}</td>
              <td class="text-right">{{ c.users_count ?? 0 }}</td>
              <td>
                <div v-if="c.assigned_admin_user" class="flex items-center gap-2">
                  <Icon name="lucide:user-check" class="h-4 w-4 text-success" />
                  <span>{{ c.assigned_admin_user.name }} {{ c.assigned_admin_user.lastname || '' }}</span>
                  <span class="text-xs text-base-content/50">({{ c.assigned_admin_user.email }})</span>
                </div>
                <span v-else class="text-warning">Unassigned</span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-1">
                  <ProcurementEntitiesAssign v-if="canAssign" :company="c" />
                  <button
                    v-if="canRemove && c.assigned_admin_user_id"
                    class="btn btn-ghost btn-xs"
                    @click="unassign(c)"
                  >
                    <Icon name="lucide:user-x" />
                    Unassign
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="store.meta.last_page > 1" class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-base-content/60">
            Page {{ store.meta.current_page }} of {{ store.meta.last_page }} · {{ store.meta.total }} total
          </div>
          <div class="join">
            <button class="btn btn-sm join-item" :disabled="store.meta.current_page <= 1 || store.loading" @click="goTo(1)">
              <Icon name="lucide:chevrons-left" />
            </button>
            <button class="btn btn-sm join-item" :disabled="store.meta.current_page <= 1 || store.loading" @click="goTo(store.meta.current_page - 1)">
              <Icon name="lucide:chevron-left" />
              Prev
            </button>
            <button class="btn btn-sm join-item btn-disabled">{{ store.meta.current_page }}</button>
            <button class="btn btn-sm join-item" :disabled="store.meta.current_page >= store.meta.last_page || store.loading" @click="goTo(store.meta.current_page + 1)">
              Next
              <Icon name="lucide:chevron-right" />
            </button>
            <button class="btn btn-sm join-item" :disabled="store.meta.current_page >= store.meta.last_page || store.loading" @click="goTo(store.meta.last_page)">
              <Icon name="lucide:chevrons-right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  canAssign: { type: Boolean, default: false },
  canRemove: { type: Boolean, default: false },
});

const store = useProcurementEntityStore();
const searchInput = ref(store.search);
let searchTimer = null;

const rowNumber = (i) => ((store.meta.current_page - 1) * store.meta.per_page) + i + 1;

const reload = () => store.fetchAll(1);
const goTo = (p) => store.fetchAll(p);

const onSearchInput = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    store.search = searchInput.value;
    store.fetchAll(1);
  }, 300);
};

const unassign = async (company) => {
  if (!confirm(`Remove handler from ${company.name}?`)) return;
  await store.unassignHandler(company.id);
};

onMounted(() => store.fetchAll(1));
</script>
