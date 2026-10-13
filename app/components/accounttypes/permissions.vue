<template>
<div>
    <button class="btn btn-sm btn-warning" @click="getModules" :disabled="loading">
        <span v-if="loading">Retrieving...</span>
        <span v-else>
            Permissions
        </span>
    </button>
    <dialog ref="permissionsModalRef" id="permissions_modal" class="modal">
        <div class="modal-box w-8/12 max-w-5xl">
            <div class="modal-header">
                <div class="flex justify-between items-center">
                    <h3 class="modal-title text-lg font-bold">Assign Permissions to {{ role.name }} for {{ accounttype.name }}</h3>
                    <button class="btn btn-ghost btn-circle" @click="closepermissionsmodal">
                        <Icon name="lucide:x" />
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <div role="alert" class="alert alert-warning alert-vertical sm:alert-horizontal" >
                    <span>You have selected {{ selectedpermissions.length }} permissions to assign to the role.</span>
                    <div class="flex justify-end items-center gap-2">
                        <button class="btn btn-sm btn-primary" @click="assignpermissions" :disabled="loading">
                            <span v-if="loading">Assigning...</span>
                            <span v-else>Assign</span>
                        </button>
                        <button class="btn btn-sm btn-error" @click="clearselectedpermissions">Clear</button>
                    </div>
                </div>
                <div class="collapse collapse-arrow bg-base-100 border border-base-300 mt-2" v-for="module in modules" :key="module.id">
                    <input type="radio" name="my-accordion"  />
                    <div class="collapse-title font-semibold">{{ module.name }}</div>
                    <div class="collapse-content text-sm">
                        <div class="collapse collapse-arrow bg-base-200 mt-2 border border-base-300" v-for="submodule in module.submodules" :key="submodule.id">
                            <input type="radio" name="submodule-accordion" />
                            <div class="collapse-title font-semibold">{{ submodule.name }}</div>
                            <div class="collapse-content text-sm">
                                <div class="grid grid-cols-3 gap-2">
                                    <button :class="['btn btn-sm btn-default btn-rounded btn-outline', selectedpermissions.includes(permission.id) ? 'btn-error' : '']" @click="selectedpermissions.includes(permission.id) ? unselectPermission(permission.id) : selectPermission(permission.id)"  v-for="permission in submodule.permissions" :key="permission.id">
                                       <Icon name="lucide:x" class="text-red-500" v-if="selectedpermissions.includes(permission.id)" />
                                       <Icon name="lucide:check" class="text-green-500" v-else />
                                        <span class="label-text">{{ permission.name }} </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
    role: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(['refreshaccounttype']);
const toast = useToast();
const modules = ref([]);
const loading = ref(false);
const permissionsModalRef = ref(null);
const closepermissionsmodal = () => {
    if (import.meta.client && permissionsModalRef.value) {
        permissionsModalRef.value.close();
    }
}
const showpermissionsmodal = () => {
    if (import.meta.client && permissionsModalRef.value) {
        permissionsModalRef.value.showModal();
    }
}

const selectedpermissions = ref([]);
const getModules = async () => {
    loading.value = true;
    const { ok, data, error } = await useModuleHelper().getmodulebyaccounttype(props.accounttype.id, props.role.id);
    modules.value = data?.accounttype?.modules ?? [];
    selectedpermissions.value = data?.assignedpermissions ?? [];
    loading.value = false;
    showpermissionsmodal();
}

const selectPermission = (permission) => {
    selectedpermissions.value.push(permission);
}
const unselectPermission = (permission) => {
    selectedpermissions.value = selectedpermissions.value.filter(p => p !== permission);
}
const clearselectedpermissions = () => {
    selectedpermissions.value = [];
}
const assignpermissions = async () => {
    loading.value = true;
    try {
        const payloads = {
            permissions: selectedpermissions.value,
            role_id: props.role.id
        }
        const { ok, data, error } = await useAccounttypeHelper().assignPermissions(props.accounttype.id, payloads);
        if (ok) {
            toast.success({
                title: 'Permissions assigned successfully',
                message: data?.message,
                position: 'topRight',
            });
            closepermissionsmodal();
            emit('refreshaccounttype');
        }
        else {
            toast.error({
                title: 'Failed to assign permissions',
                message: error ?? 'Unknown error',
                position: 'topRight',
            });
        }
    }
    catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to assign permissions',
            message: err?.message ?? 'Unknown error',
            position: 'topRight',
        });
    } finally {
        loading.value = false;
    }
}
</script>