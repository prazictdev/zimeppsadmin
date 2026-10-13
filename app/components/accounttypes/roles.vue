<template>
    <div>
        <div class="card border border-base-200 ">
        
        <div class="card-body">
            
            <div class=" bg-base-200 rounded-md p-5">
                <div class="flex justify-between items-center">
                    <div class="text-lg font-bold">{{ accounttype?.name ?? 'Account type' }} Assigned Roles</div>
                    <button class="btn btn-sm btn-primary" @click="getunassignedroles" :disabled="loading">
                        <span v-if="loading">Retrieving...</span>
                        <span v-else>Assign Roles</span>
                    </button>
                </div>
            </div>

            <table class="table table-pin-cols table-pin-rows">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="role in accounttype?.roles ?? []" :key="role.id">
                        <td>
                            <span>{{ role.name }}</span>
                            <span v-if="role.pivot?.is_primary" class="badge badge-primary badge-sm ml-2">Primary</span>
                        </td>
                        <td class="flex justify-end items-center gap-2">
                            <button class="btn btn-sm btn-error" @click="unassignrole(role.id)" :disabled="loading">
                                <span v-if="loading">Unassigning...</span>
                                <span v-else>Unassign</span>
                            </button>
                            <AccounttypesPermissions :accounttype="accounttype" :role="role" @refreshaccounttype="emit('refreshaccounttype')" />
                        </td>
                    </tr>
                    <tr v-if="!accounttype?.roles || !(accounttype?.roles?.length)">
                        <td colspan="2" class="text-center">No roles found</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    <dialog ref="unassignedrolesmodalref" id="unassignedroles_modal" class="modal">
        <div class="modal-box">
            <div class="modal-header">
                <div class="flex justify-between items-center">
                    <h3 class="modal-title text-lg font-bold">Unassigned Roles</h3>
                    <button class="btn btn-ghost btn-circle" @click="closeunassignedrolesmodal">
                        <Icon name="lucide:x" />
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div role="alert" class="alert alert-info alert-vertical sm:alert-horizontal mb-3" v-if="hasExistingPrimary">
                    <Icon name="lucide:info" />
                    <span>This account type already has a primary role (<strong>{{ existingPrimaryRole?.name }}</strong>). You cannot mark another role as primary unless you unassign the current primary first.</span>
                </div>
                <div role="alert" class="alert alert-warning alert-vertical sm:alert-horizontal" v-if="selectedroles.length > 0">
                    <span>You have selected {{ selectedroles.length }} role(s) to assign<span v-if="primaryRoleId"> — <strong>{{ roles.find(r => r.id === primaryRoleId)?.name }}</strong> will be primary</span>.</span>
                    <div class="flex justify-end items-center gap-2">
                        <button class="btn btn-sm btn-primary" @click="assignroles" :disabled="loading">
                            <span v-if="loading">Assigning...</span>
                            <span v-else>Assign</span>
                        </button>
                        <button class="btn btn-sm btn-error" @click="clearselectedroles">Clear</button>
                    </div>
                </div>
                <table class="table table-pin-cols table-pin-rows">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Primary</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="role in roles" :key="role.id">
                            <td>{{ role.name }}</td>
                            <td>
                                <input
                                    type="radio"
                                    class="radio radio-primary radio-sm"
                                    :value="role.id"
                                    v-model="primaryRoleId"
                                    :disabled="!selectedroles.includes(role.id) || hasExistingPrimary"
                                    @click="togglePrimary(role.id)"
                                />
                            </td>
                            <td class="flex justify-end items-center gap-2">
                                <button class="btn btn-sm btn-primary" @click="selectrole(role.id)" :disabled="selectedroles.includes(role.id)">
                                    <Icon name="lucide:check" />
                                </button>
                                <button class="btn btn-sm btn-error" @click="unselectrole(role.id)" :disabled="!selectedroles.includes(role.id)">
                                    <Icon name="lucide:x" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </div>
        
    </dialog>
</div>
</template>
<script setup>

const props = defineProps({
    accounttype: {
        type: Object,
        required: true,
    },
});
const toast = useToast();
const emit = defineEmits(['refreshaccounttype']);
const roles = ref([]);
const loading = ref(false);
const unassignedrolesmodalref = ref(null);
const selectedroles = ref([]);
const primaryRoleId = ref(null);

const hasExistingPrimary = computed(() =>
    (props.accounttype?.roles ?? []).some(r => r.pivot?.is_primary)
);
const existingPrimaryRole = computed(() =>
    (props.accounttype?.roles ?? []).find(r => r.pivot?.is_primary) ?? null
);

const getunassignedroles = async () => {
    loading.value = true;
    try {
        const { ok, data, error } = await useRoleHelper().getUnassignedRoles(props.accounttype.id);
        if (ok) {
            roles.value = data ?? [];
            showunassignedrolesmodal();
        } else if (error) {
            toast.error({
                title: 'Failed to load unassigned roles',
                message: error ?? 'Unknown error',
            });
        }
    }catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to load unassigned roles',
            message: err?.message ?? 'Unknown error',
        });
    } finally {
        loading.value = false;
    }
}
const showunassignedrolesmodal = () => {
    if (import.meta.client && unassignedrolesmodalref.value) {
        unassignedrolesmodalref.value.showModal();
    }
}
const closeunassignedrolesmodal = () => {
    if (import.meta.client && unassignedrolesmodalref.value) {
        unassignedrolesmodalref.value.close();
    }
}
const selectrole = (role_id) => {
    selectedroles.value.push(role_id);
}
const unselectrole = (role_id) => {
    selectedroles.value = selectedroles.value.filter(id => id !== role_id);
    if (primaryRoleId.value === role_id) {
        primaryRoleId.value = null;
    }
}
const togglePrimary = (role_id) => {
    if (primaryRoleId.value === role_id) {
        primaryRoleId.value = null;
    }
}
const clearselectedroles = () => {
    selectedroles.value = [];
    primaryRoleId.value = null;
}
const assignroles = async () => {
    loading.value = true;
    try {
        const rolesPayload = selectedroles.value.map(id => ({ id, is_primary: id === primaryRoleId.value }));
        const { ok, data, error } = await useAccounttypeHelper().assignRoles(props.accounttype.id, rolesPayload);
        if (ok) {
            closeunassignedrolesmodal();
            clearselectedroles();
            toast.success({
                title: 'Roles assigned successfully',
                message: data?.message,
            });
            emit('refreshaccounttype');
        }
        else {
            toast.error({
                title: 'Failed to assign roles',
                message: error ?? 'Unknown error',
            });
        }
    }
     catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to assign roles',
            message: err?.message ?? 'Unknown error',
        });
    } finally {
        loading.value = false;
    }
}
const unassignrole = async (role_id) => {
    loading.value = true;
    try {
        const { ok, data, error } = await useAccounttypeHelper().unassignRole(props.accounttype.id, role_id);
        if (ok) {
            toast.success({
                title: 'Role unassigned successfully',
                message: data?.message,
            });
            emit('refreshaccounttype');
        }
    } catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to unassign role',
            message: err?.message ?? 'Unknown error',
        });
    } finally {
        loading.value = false;
    }
}
</script>