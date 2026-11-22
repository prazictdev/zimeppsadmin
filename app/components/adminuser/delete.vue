<template>
    <div>
        <button class="btn btn-error btn-xs ml-2" @click="openDeleteModal">
            <Icon name="lucide:trash" />
            <span class="hidden md:block">Delete</span>
        </button>
        <dialog ref="deleteModal" :id="`delete_admin_user_modal_${user.id}`" class="modal">
            <div class="modal-box">
                <div class="flex justify-between">
                    <h3 class="text-lg font-bold">Delete User</h3>
                    <button class="btn btn-ghost btn-circle" @click="closeDeleteModal">
                        <Icon name="lucide:x" />
                    </button>
                </div>
                <form method="dialog" @submit.prevent="handleSubmit">
                    <div class="form-control">
                        <p>Are you sure you want to delete this user: <span class="font-bold">{{ user?.name }}</span>?</p>
                    </div>
                    <div class="modal-action">
                        <button class="btn" type="button" @click="closeDeleteModal">Close</button>
                        <button class="btn btn-error" type="submit" :disabled="submitting">
                            <span v-if="submitting">Deleting...</span>
                            <span v-else>Delete</span>
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    </div>
</template>
<script setup>
const props = defineProps({
    user: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(['refreshcompany']);
const userHelper = useUserHelper();
const submitting = ref(false);
const toast = useToast();
const deleteModal = ref(null);
const handleSubmit = async () => {
    try {
        submitting.value = true;
       const { ok, error } = await userHelper.deleteUser(props.user.id);
       if (ok) {
        toast.success({
            title: 'User deleted successfully',
            description: 'User deleted successfully',
            position: 'topRight',
            layout: 2,
        });
        emit('refreshcompany');
        closeDeleteModal();
       }else{
        toast.error({
            title: 'User deletion failed',
            description: error,
            position: 'topRight',
            layout: 2,
        });
       }
      
    } finally {
        submitting.value = false;
    }
};
const openDeleteModal = () => {
    deleteModal.value?.showModal();
};
const closeDeleteModal = () => {
    deleteModal.value?.close();
};
</script>
