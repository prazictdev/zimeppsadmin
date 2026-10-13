<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Procurement Management Unit</span>
        <span class="text-xs text-base-content/60">{{ store.pmuMembersMeta.total }} member{{ store.pmuMembersMeta.total === 1 ? '' : 's' }}</span>
      </div>

      <div v-if="store.subResourceLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <div v-else class="mt-3 overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-left">
              <th>#</th>
              <th>Name</th>
              <th>Position</th>
              <th>Email</th>
              <th>Role</th>
              <th>Gender</th>
              <th class="text-right">Qualifications</th>
              <th class="text-right">Work history</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.pmuMembers.length">
              <td colspan="8" class="text-center text-base-content/50">No PMU members.</td>
            </tr>
            <tr v-for="(m, i) in store.pmuMembers" :key="m.id">
              <td>{{ rowNumber(i) }}</td>
              <td class="font-medium">
                <span class="flex items-center gap-2">
                  {{ m.name }}
                  <span v-if="m.is_head" class="badge badge-primary badge-sm gap-1">
                    <Icon name="lucide:crown" class="h-3 w-3" /> Head
                  </span>
                </span>
              </td>
              <td>{{ m.designation || '—' }}</td>
              <td class="text-xs">{{ m.email || m.user?.email || '—' }}</td>
              <td>{{ m.role?.name || '—' }}</td>
              <td>{{ m.gender || '—' }}</td>
              <td class="text-right">{{ (m.qualifications ?? []).length }}</td>
              <td class="text-right">{{ (m.workhistory ?? []).length }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ planUuid: { type: String, required: true } });
const store = useAdminPlanStore();

const rowNumber = (i) => ((store.pmuMembersMeta.current_page - 1) * store.pmuMembersMeta.per_page) + i + 1;

onMounted(() => store.loadPmuMembers(props.planUuid, 1));
</script>
