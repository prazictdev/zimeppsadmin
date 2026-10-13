<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_bankaccesstoken_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Bank Access Token</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_bankaccesstoken_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <!-- Token display with regenerate -->
            <label class="fieldset">
              <span class="fieldset-legend">Token</span>
              <div class="flex gap-2">
                <input
                  :value="currentToken"
                  type="text"
                  readonly
                  class="input input-bordered w-full font-mono text-sm"
                />
                <button
                  class="btn btn-ghost btn-square"
                  type="button"
                  title="Copy token"
                  @click="copyToken(currentToken)"
                >
                  <Icon name="lucide:copy" />
                </button>
              </div>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Status</span>
              <select
                v-model="form.status"
                :class="['select select-bordered w-full', errors.status ? 'select-error' : '']"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
              <label v-if="errors.status" class="label">
                <span class="label-text-alt text-red-600">{{ errors.status }}</span>
              </label>
            </label>

            <div class="divider my-0"></div>

            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">Regenerate Token</p>
                <p class="text-xs text-base-content/60">Issue a new token — the old one will be invalidated immediately.</p>
              </div>
              <button
                class="btn btn-warning btn-sm"
                type="button"
                :disabled="regenerating"
                @click="handleRegenerate"
              >
                <Icon name="lucide:refresh-cw" />
                <span v-if="regenerating">Regenerating...</span>
                <span v-else>Regenerate</span>
              </button>
            </div>
          </div>

          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_bankaccesstoken_modal_${item.id}').close()`"
            >
              Close
            </button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting">Saving...</span>
              <span v-else>Save</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });

const store = useBankAccessTokenStore();
const toast = useToast();

const form = ref({ status: 'ACTIVE' });
const errors = reactive({ status: '' });
const submitting = ref(false);
const regenerating = ref(false);
const currentToken = ref('');

const openModal = async () => {
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value.status = data.status ?? 'ACTIVE';
    currentToken.value = data.token ?? '';
  }
  document.getElementById(`edit_bankaccesstoken_modal_${props.item.id}`).showModal();
};

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token);
    toast.success({ title: 'Copied', message: 'Token copied to clipboard.', position: 'topRight', layout: 2 });
  } catch {
    toast.error({ title: 'Error', message: 'Failed to copy token.', position: 'topRight', layout: 2 });
  }
};

const handleRegenerate = async () => {
  regenerating.value = true;
  const result = await store.regenerate(props.item.id);
  if (result?.token) {
    currentToken.value = result.token;
  }
  regenerating.value = false;
};

const handleSubmit = async () => {
  errors.status = '';
  try {
    submitting.value = true;
    const valid = await BankAccessTokenUpdateSchema.validate(form.value, { abortEarly: false });
    await store.update(props.item.id, valid);
    document.getElementById(`edit_bankaccesstoken_modal_${props.item.id}`).close();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) errors[e.path] = e.message;
      });
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    }
  } finally {
    submitting.value = false;
  }
};
</script>
