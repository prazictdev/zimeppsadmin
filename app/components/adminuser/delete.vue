<template>
    <div>
        <button v-if="!isCurrentUser" class="btn btn-error btn-xs ml-2" @click="openDeleteModal">
            <Icon name="lucide:trash" />
            <span class="hidden md:block">Remove</span>
        </button>
        <dialog ref="deleteModal" :id="`delete_admin_user_modal_${user.id}`" class="modal">
            <div class="modal-box">
                <div class="flex justify-between">
                    <h3 class="text-lg font-bold">Remove user?</h3>
                    <button class="btn btn-ghost btn-circle" @click="closeDeleteModal">
                        <Icon name="lucide:x" />
                    </button>
                </div>
                <form method="dialog" @submit.prevent="handleSubmit">
                    <div>
                        <p>You are about to remove access for <span class="font-bold">{{ fullName }}</span>.</p>
                        <div role="alert" class="alert alert-warning mt-4 items-start">
                            <Icon name="lucide:triangle-alert" class="h-5 w-5" />
                            <span class="text-sm">If this user has transaction history, the account will be deactivated and retained for audit purposes. Otherwise, it will be permanently deleted.</span>
                        </div>
                    </div>
                    <div class="modal-action">
                        <button class="btn" type="button" @click="closeDeleteModal">Close</button>
                        <button class="btn btn-error" type="submit" :disabled="submitting">
                            <span v-if="submitting">Removing...</span>
                            <span v-else>Remove user</span>
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
const { user: authenticatedUser } = useSanctumAuth();
const submitting = ref(false);
const toast = useToast();
const deleteModal = ref(null);
const currentUserId = computed(() => authenticatedUser.value?.data?.user?.id ?? null);
const isCurrentUser = computed(() => Number(props.user.id) === Number(currentUserId.value));
const fullName = computed(() => [props.user.name, props.user.middlename, props.user.lastname].filter(Boolean).join(' '));
const handleSubmit = async () => {
    try {
        submitting.value = true;
       const { ok, data, error } = await userHelper.deleteUser(props.user.id);
       if (ok) {
        toast.success({
            title: data?.data?.action === 'deactivated' ? 'User deactivated' : 'User deleted',
            description: data?.message ?? 'User access was removed successfully.',
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
