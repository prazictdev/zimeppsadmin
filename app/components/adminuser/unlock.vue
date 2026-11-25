<template>
  <div v-if="isTemporarilyLocked">
    <button class="btn btn-xs btn-warning" title="Clear temporary login lock" @click="openDialog">
      <Icon name="lucide:lock-keyhole-open" class="h-3.5 w-3.5" />
      <span class="hidden md:block">Unlock</span>
    </button>

    <dialog ref="dialog" class="modal">
      <div class="modal-box text-left">
        <div class="flex items-start gap-3">
          <div class="rounded-full bg-warning/15 p-2 text-warning">
            <Icon name="lucide:lock-keyhole-open" class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-lg font-bold">Clear temporary login lock?</h3>
            <p class="mt-1 text-sm text-base-content/70">
              Allow <strong>{{ fullName }}</strong> to try signing in again immediately.
            </p>
          </div>
        </div>

        <div role="alert" class="alert alert-info mt-4 items-start">
          <Icon name="lucide:shield-check" class="h-5 w-5" />
          <div class="text-sm">
            <p>The failed-attempt counter and temporary lock will be cleared.</p>
            <p class="mt-1 opacity-70">The password, activation status, and login-attempt audit history will remain unchanged.</p>
          </div>
        </div>

        <p class="mt-4 text-sm text-base-content/60">Current lock expires {{ lockExpiry }}.</p>

        <div class="modal-action">
          <button class="btn" :disabled="submitting" @click="closeDialog">Cancel</button>
          <button class="btn btn-warning" :disabled="submitting" @click="unlockUser">
            <span v-if="submitting" class="loading loading-spinner loading-xs" />
            Unlock user
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Close</button></form>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  user: { type: Object, required: true },
});

const emit = defineEmits(['refreshcompany']);
const dialog = ref(null);
const submitting = ref(false);
const toast = useToast();
const userHelper = useUserHelper();

const isTemporarilyLocked = computed(() => Boolean(
  props.user?.locked_until && new Date(props.user.locked_until).getTime() > Date.now(),
));

const fullName = computed(() => [props.user?.name, props.user?.middlename, props.user?.lastname]
  .filter(Boolean)
  .join(' ') || 'this user');

const lockExpiry = computed(() => new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(props.user.locked_until)));

const openDialog = () => dialog.value?.showModal();
const closeDialog = () => dialog.value?.close();

const unlockUser = async () => {
  submitting.value = true;
  const { ok, data, error } = await userHelper.unlockUser(props.user.id);
  submitting.value = false;

  if (!ok) {
    toast.error({
      title: 'Unable to unlock user',
      message: error,
      position: 'topRight',
      layout: 2,
    });
    return;
  }

  toast.success({
    title: 'User unlocked',
    message: data?.message ?? 'The user can try signing in again immediately.',
    position: 'topRight',
    layout: 2,
  });
  closeDialog();
  emit('refreshcompany');
};
</script>
