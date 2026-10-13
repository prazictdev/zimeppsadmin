<template>
<div>
    <div class="card border border-base-200 ">
        
        <div class="card-body">
            
            <div class=" bg-base-200 rounded-md p-5">
                <div class="flex justify-between items-center">
                    <div class="text-lg font-bold">{{ accounttype?.name ?? 'Account type' }} Assigned Modules</div>
                    <button class="btn btn-sm btn-primary" @click="getunassignedmodules" :disabled="loading">
                        <span v-if="loading">Retrieving...</span>
                        <span v-else>Assign Modules</span>
                    </button>
                </div>
            </div>
         
        
    <table class="table  table-pin-cols table-pin-rows">
        <thead>
            <tr>
                <th>Name</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="module in accounttype?.modules ?? []" :key="module.id">
                <td>{{ module.name }}</td>
                <td class="flex justify-end items-center gap-2">
                    <button class="btn btn-sm btn-error" @click="unassignmodule(module.id)" :disabled="loading">
                        <span v-if="loading">Unassigning...</span>
                        <span v-else>Unassign</span>
                        <Icon name="lucide:x" />
                    </button>
                </td>
            </tr>
            <tr v-if="!accounttype?.modules || !(accounttype?.modules?.length)">
                <td colspan="2" class="text-center">No modules found</td>
            </tr>
        </tbody>
    </table>
    </div>
    </div>


   
<dialog ref="unassignedModalRef" id="unassignedmodules_modal" class="modal">
    <div class="modal-box">
        <div class="modal-header">
            <div class="flex justify-between items-center">
                <h3 class="modal-title text-lg font-bold">Unassigned Modules</h3>
                <button class="btn btn-ghost btn-circle" @click="closeunassignedmodules">
                    <Icon name="lucide:x" />
                </button>
            </div>
        </div>
        <div role="alert" class="alert alert-warning alert-vertical sm:alert-horizontal" v-if="selectedmodules.length > 0">
  
  <span>You have selected {{ selectedmodules.length }} modules to assign to the account type.</span>
  <div class="flex justify-end items-center gap-2">
    <button class="btn btn-sm btn-primary" @click="assignmodules" :disabled="loading">
        <span v-if="loading">Assigning...</span>
        <span v-else>Assign</span>
    </button>
    <button class="btn btn-sm btn-error" @click="clearselectedmodules">Clear</button>
  </div>
</div>
        <table class="table table-zebra table-pin-cols table-pin-rows">
            <thead>
                <tr>
                    <th>Name</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="module in unassignedmodules" :key="module.id">
                    <td>{{ module.name }}</td>
                    <td class="flex justify-center items-center gap-2">
                        <button class="btn btn-sm btn-primary" @click="selectmodule(module.id)" :disabled="selectedmodules.includes(module.id)">
                            <Icon name="lucide:check" />
                        </button>
                        <button class="btn btn-sm btn-error" @click="unselectmodule(module.id)" :disabled="!selectedmodules.includes(module.id)">
                            <Icon name="lucide:x" />
                        </button>
                    </td>
                </tr>
                <tr v-if="!unassignedmodules || !(unassignedmodules.length)">
                    <td colspan="2" class="text-center">No unassigned modules found</td>
                </tr>
            </tbody>
        </table>
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
const {can} = useAbility();
const emit = defineEmits(['refreshaccounttype']);
const toast = useToast();
const unassignedmodules = ref([]);
const loading = ref(false);
const selectedmodules = ref([]);
const unassignedModalRef = ref(null);
const canassignmodules = computed(()=>can("can.assign.modules"));
const getunassignedmodules = async () => {
    loading.value = true;
    try {
        const { ok, data, error } = await useModuleHelper().getunassignedmodules(props.accounttype.id);
        if (ok) {
            unassignedmodules.value = data ?? [];
            showunassignedmodules();
        } else if (error) {
            toast.error({
                title: 'Failed to load unassigned modules',
                message: error ?? 'Unknown error',
            });
        }
    } catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to load unassigned modules',
            message: err?.message ?? 'Unknown error',
        });
    } finally {
        loading.value = false;
    }
}
const showunassignedmodules = () => {
    if (import.meta.client && unassignedModalRef.value) {
        unassignedModalRef.value.showModal();
    }
}
const closeunassignedmodules = () => {
    if (import.meta.client && unassignedModalRef.value) {
        unassignedModalRef.value.close();
    }
}
const selectmodule = (module_id) => {
    selectedmodules.value.push(module_id);
}
const unselectmodule = (module_id) => {
    selectedmodules.value = selectedmodules.value.filter(id => id !== module_id);
}
const clearselectedmodules = () => {
    selectedmodules.value = [];
}
const assignmodules = async () => {
    loading.value = true;
    try {
    const { ok, data, error } = await useAccounttypeHelper().assignModules(props.accounttype.id, selectedmodules.value);
    if (ok) {
        closeunassignedmodules();
        clearselectedmodules();
        toast.success({
            title: 'Modules assigned successfully',
            message: data?.message,
        });
        emit('refreshaccounttype');
    }
    else {
        toast.error({
            title: 'Failed to assign modules',
            message: error ?? 'Unknown error',
        });
    }
    } catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to assign modules',
            message: err?.message ?? 'Unknown error',
        });
    } finally {
        loading.value = false;
    }
}
const unassignmodule = async (module_id) => {
    loading.value = true;
    try {
    const { ok, data, error } = await useAccounttypeHelper().unasignModules(props.accounttype.id, module_id);
    if (ok) {
        toast.success({
            title: 'Module unassigned successfully',
            message: data?.message,
        });
        emit('refreshaccounttype');
    }
    } catch (err) {
        console.error(err);
        toast.error({
            title: 'Failed to unassign module',
            message: err?.message ?? 'Unknown error',
        });
    } finally {
        loading.value = false;
    }
}

</script>