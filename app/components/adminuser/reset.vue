<template>
    <div>
        <button class="btn btn-xs btn-warning" @click="openResetPasswordModal">
            <Icon name="lucide:rotate-cw" />
            <span class="hidden md:block">Reset</span>
        </button>
        <dialog :id="`reset_password_modal_${user.id}`" class="modal">
            <div class="modal-box ">
                <div class="bg-warning p-1 rounded-md text-white flex justify-between">
                    <h3 class="text-lg font-bold">Reset Password</h3>
                    <button class="btn btn-ghost btn-circle" @click="closeResetPasswordModal">
                        <Icon name="lucide:x" />
                    </button>
                </div>
                <form method="dialog" @submit.prevent="handleSubmit">
                    <div class="form-control mt-3">
                        <p>Are you sure you want to reset the password for this user: <span class="font-bold">{{ user.name }}</span>?</p>
                    </div>
                    <div class="modal-action">
                        <button class="btn" type="button" @click="closeResetPasswordModal">Close</button>
                        <button class="btn btn-primary" type="submit" :disabled="submitting">
                            <span v-if="submitting">Resetting...</span>
                            <span v-else>Reset</span>
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
const toast = useToast();
const submitting = ref(false);
const userHelper = useUserHelper();
const emit = defineEmits(['refreshcompany']);

const handleSubmit = async () => {
    try {
        submitting.value = true;
        const { ok, data, error } = await userHelper.resetPassword(props?.user?.email);
        if (ok) {
            toast.success({
                title: 'Password reset successfully',
                description: data?.message || 'Password reset email sent successfully.',
                position: 'topRight',
                layout: 2,
            });
            emit('refreshcompany');
            closeResetPasswordModal();
        }
        else {
            toast.error({
                title: 'Password reset failed',
                description: error || 'Unable to send password reset email.',
                position: 'topRight',
                layout: 2,
            });
        }
   
    } catch (err) {
        toast.error({
            title: 'Password reset failed',
            description: err.message,
            position: 'topRight',
            layout: 2,
        });
    } finally {
        submitting.value = false;
        closeResetPasswordModal();
    }
}
const openResetPasswordModal = () => {
    document.getElementById(`reset_password_modal_${props.user.id}`).showModal();
}
const closeResetPasswordModal = () => {
    document.getElementById(`reset_password_modal_${props.user.id}`).close();
}

</script>