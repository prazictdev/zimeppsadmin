<template>
  <div>
    <button class="btn btn-xs btn-success" @click="getCompanymodules">
      <Icon name="lucide:key-round" />
      <span class="hidden md:block">
        <span v-if="loading">Retrieving...</span>
        <span v-else>Access</span>
      </span>
    </button>
    <dialog ref="newUserAccessModal" class="modal">
      <div class="modal-box w-10/12 max-w-5xl">
        <div class="bg-primary p-3 rounded-md text-white flex justify-between">
          <h3 class="text-lg font-bold">User Access</h3>
          <button class="btn btn-ghost btn-circle" @click="closeCreateModal">
            <Icon name="lucide:x" />
          </button>
        </div>
        <div
          class="collapse collapse-arrow bg-base-100 border border-base-300 mt-2"
          v-for="accounttype in payload?.accounttypes ?? []"
          :key="accounttype.id"
        >
          <input
            type="radio"
            :name="`my-accordion-1`"
          />
          <div class="collapse-title font-semibold">{{ accounttype.name }}</div>
          <div class="collapse-content">
            <div class="tabs tabs-lift">
  <!-- <input type="radio" name="my_tabs_${accounttype.id}" class="tab" aria-label="Role based access" checked /> -->
  <!-- <div class="tab-content bg-base-100 border-base-300 p-6"> -->
    <table class="table table-pin-cols table-pin-rows">
        
        <tbody>
            <tr v-for="role in accounttype.roles" :key="role.id">
                <td>{{ role.name }}{{(user.roles?.filter(r => r.id === role.id) ?? []).length > 0 ? ' (Assigned)' : ''}}</td>
                <td class="flex justify-end">
                    <button v-if="!(user.roles?.filter(r => r.id === role.id) ?? []).length > 0" class="btn btn-sm btn-primary" @click="assignRole(role.id)">
                      <Icon name="lucide:check" />
                      <span class="hidden md:block">
                        <span v-if="loading">Assigning...</span>
                        <span v-else>Assign</span>
                      </span>
                    </button>
                    <button v-else class="btn btn-sm btn-error" @click="unassignRole(role.id)">
                      <Icon name="lucide:x" />
                      <span class="hidden md:block">
                        <span v-if="loading">Unassigning...</span>
                        <span v-else>Unassign</span>
                      </span>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
  <!-- </div> -->

 <!--  <input type="radio" name="my_tabs_${accounttype.id}" class="tab" aria-label="Permissions based access" />
  <div class="tab-content bg-base-100 border-base-300 p-6">
    <div class="collapse bg-base-100 border border-base-300" v-for="module in accounttype.modules" :key="module.id">
  <input type="radio" name="my-accordion-2" checked="checked" />
  <div class="collapse-title font-semibold">{{ module.name }}</div>
  <div class="collapse-content text-sm">
    <table class="table table-xs">
       
        <tbody>
            <tr v-for="submodule in module.submodules" :key="submodule.id">
                <td>{{ submodule.name }}</td>
                <td>
                    <table class="table table-xs">
                       
                        <tbody>
                            <tr v-for="permission in submodule.permissions" :key="permission.id">
                                <td>{{ permission.name }}</td>
                                <td class="flex justify-end">
                                    <button class="btn btn-sm btn-primary">Assign</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    </td>
                </tr>
        </tbody>
    </table>
  </div>
  </div>
</div> -->
</div>
          </div>

        </div>
      </div>
    </dialog>
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  company: {
    type: Object,
    required: true,
  },
});
const loading = ref(false);
const userHelper = useUserHelper();
const companyHelper = useCompanyHelper();
const newUserAccessModal = ref(null);
const toast = useToast();
const payload = ref(null);
const emit = defineEmits(['refreshuser']);
const getCompanymodules = async () => {
  try {
    loading.value = true;
    const { ok, data, error } = await companyHelper.getCompanymodules(props.company.id);
    if (ok) {
      payload.value = data;
      openCreateModal();
    } else if (error) {
      toast.error({
        title: "Failed to load company modules",
        message: error,
      });
    }
    loading.value = false;
  } catch (err) {
    console.error(err);
    toast.error({
      title: "Failed to load company modules",
      message: err?.message ?? "Unknown error",
    });
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  newUserAccessModal.value.showModal();
};
const closeCreateModal = () => {
  newUserAccessModal.value.close();
};
const assignRole = async (roleId) => {
  try {
    loading.value = true;
    const roles =  [roleId];
    const { ok, data, error } = await userHelper.assignRoles(props.user.id, roles);
    if (ok) {
      toast.success({
        title: 'Role assigned successfully',
        message: data?.message,
        position: 'topRight',
        layout: 2,
      });
      emit('refreshuser');
    } else {
      toast.error({
        title: 'Failed to assign role',
        message: error,
        position: 'topRight',
        layout: 2,
      });
    }
  } catch (err) {
    console.error(err);
    toast.error({
      title: 'Failed to assign role',
      message: err?.message ?? 'Unknown error',
      position: 'topRight',
      layout: 2,
    });
  } finally {
    loading.value = false;
  }
};
const unassignRole = async (roleId) => {
  try {
    loading.value = true;
    const { ok, data, error } = await userHelper.unassignRole(props.user.id, roleId);
    if (ok) {
      toast.success({
        title: 'Role unassigned successfully',
        message: data?.message,
        position: 'topRight',
        layout: 2,
      });
      emit('refreshuser');
    } else {
      toast.error({
        title: 'Failed to unassign role',
        message: error,
        position: 'topRight',
        layout: 2,
      });
    }
  } catch (err) {
    console.error(err);
    toast.error({
      title: 'Failed to unassign role',
      message: err?.message ?? 'Unknown error',
      position: 'topRight',
      layout: 2,
    });
  } finally {
    loading.value = false;
  }
};
</script>