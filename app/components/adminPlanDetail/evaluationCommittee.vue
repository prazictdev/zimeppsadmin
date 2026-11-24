<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Evaluation Committee</span>
        <span class="text-xs text-base-content/60">{{ store.evaluationMembersMeta.total }} member{{ store.evaluationMembersMeta.total === 1 ? '' : 's' }}</span>
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
              <th>Email</th>
              <th>Phone</th>
              <th>Designation</th>
              <th>Role</th>
              <th>Gender</th>
              <th class="text-right">Qualifications</th>
              <th class="text-right">Work history</th>
              <th><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.evaluationMembers.length">
              <td colspan="10" class="text-center text-base-content/50">No committee members.</td>
            </tr>
            <tr v-for="(m, i) in store.evaluationMembers" :key="m.id">
              <td>{{ rowNumber(i) }}</td>
              <td class="font-medium">{{ memberName(m) }}</td>
              <td class="text-xs">{{ m.email || m.user?.email || '—' }}</td>
              <td class="text-xs">{{ m.phone || '—' }}</td>
              <td>{{ m.designation || '—' }}</td>
              <td>{{ m.role?.name || '—' }}</td>
              <td>{{ m.gender || '—' }}</td>
              <td class="text-right">{{ (m.qualifications ?? []).length }}</td>
              <td class="text-right">{{ (m.workhistory ?? []).length }}</td>
              <td class="text-right">
                <button type="button" class="btn btn-outline btn-xs whitespace-nowrap" @click="selectedMember = m">
                  <Icon name="lucide:eye" class="h-3.5 w-3.5" /> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <AdminPlanDetailCommitteeMemberProfile
      v-if="selectedMember"
      :member="selectedMember"
      committee-label="Evaluation Committee"
      supports-professional-profile
      @close="selectedMember = null"
    />
  </div>
</template>

<script setup>
const props = defineProps({ planUuid: { type: String, required: true } });
const store = useAdminPlanStore();
const selectedMember = ref(null);

const rowNumber = (i) => ((store.evaluationMembersMeta.current_page - 1) * store.evaluationMembersMeta.per_page) + i + 1;

const memberName = (m) => {
  const parts = [m.firstname || m.user?.name, m.lastname || m.user?.lastname].filter(Boolean);
  return parts.join(' ') || m.fullname || '—';
};

onMounted(() => store.loadEvaluationMembers(props.planUuid, 1));
</script>
