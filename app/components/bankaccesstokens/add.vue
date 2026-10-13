<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Token</span>
    </button>
    <dialog id="new_bankaccesstoken_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New Bank Access Token</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_bankaccesstoken_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>

        <!-- Token display after creation -->
        <div v-if="createdToken" class="mt-3">
          <div role="alert" class="alert alert-success mb-3">
            <Icon name="lucide:check-circle" />
            <span>Token created. Copy it now — it will be masked after you close this dialog.</span>
          </div>
          <label class="fieldset">
            <span class="fieldset-legend">Generated Token</span>
            <div class="flex gap-2">
              <input
                :value="createdToken"
                type="text"
                readonly
                class="input input-bordered w-full font-mono text-sm"
              />
              <button class="btn btn-ghost btn-square" type="button" @click="copyToken(createdToken)">
                <Icon name="lucide:copy" />
              </button>
            </div>
          </label>
          <div class="modal-action">
            <button class="btn btn-primary" type="button" @click="closeModal">Done</button>
          </div>
        </div>

        <!-- Creation form -->
        <form v-else @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Bank</span>
              <select
                v-model="form.bank_id"
                :class="['select select-bordered w-full', errors.bank_id ? 'select-error' : '']"
              >
                <option value="" disabled>Select bank</option>
                <option v-for="bank in bankStore.items" :key="bank.id" :value="bank.id">
                  {{ bank.name }}
                </option>
              </select>
              <label v-if="errors.bank_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.bank_id }}</span>
              </label>
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
            <p class="text-sm text-base-content/60">
              <Icon name="lucide:info" class="inline h-4 w-4" />
              A secure token will be auto-generated for the selected bank.
            </p>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" onclick="new_bankaccesstoken_modal.close()">Cancel</button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting">Generating...</span>
              <span v-else>Generate Token</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const store = useBankAccessTokenStore();
const bankStore = useBankStore();
const toast = useToast();

const form = ref({ bank_id: '', status: 'ACTIVE' });
const errors = reactive({ bank_id: '', status: '' });
const submitting = ref(false);
const createdToken = ref('');

const openModal = async () => {
  createdToken.value = '';
  form.value = { bank_id: '', status: 'ACTIVE' };
  errors.bank_id = '';
  errors.status = '';
  if (bankStore.items.length === 0) await bankStore.fetchAll();
  document.getElementById('new_bankaccesstoken_modal').showModal();
};

const closeModal = () => {
  createdToken.value = '';
  document.getElementById('new_bankaccesstoken_modal').close();
};

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token);
    toast.success({ title: 'Copied', message: 'Token copied to clipboard.', position: 'topRight', layout: 2 });
  } catch {
    toast.error({ title: 'Error', message: 'Failed to copy token.', position: 'topRight', layout: 2 });
  }
};

const handleSubmit = async () => {
  errors.bank_id = '';
  errors.status = '';
  try {
    submitting.value = true;
    const valid = await BankAccessTokenSchema.validate(form.value, { abortEarly: false });
    const result = await store.create(valid);
    if (result?.token) {
      createdToken.value = result.token;
    }
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
