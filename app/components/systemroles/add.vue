<template>
  <div>
    <button class="btn btn-success" onclick="new_system_role_modal.showModal()">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Role</span>
    </button>
    <dialog id="new_system_role_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New system role</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_system_role_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-2">
            <label class="fieldset">
              <input
                type="text"
                v-model="form.name"
                placeholder="Role name"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
            <label class="fieldset">
              <input
                type="text"
                v-model="form.guard_name"
                placeholder="Guard name"
                :class="['input input-bordered w-full', errors.guard_name ? 'input-error' : '']"
              />
              <label v-if="errors.guard_name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.guard_name }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button class="btn" type="button" onclick="new_system_role_modal.close()">Close</button>
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
const systemroleStore = useSystemroleStore();
const form = ref({ name: '', guard_name: 'web' });
const errors = reactive({ name: '', guard_name: '' });
const submitting = ref(false);

const resetForm = () => {
  form.value = { name: '', guard_name: 'web' };
  errors.name = '';
  errors.guard_name = '';
};

const handleSubmit = async () => {
  errors.name = '';
  errors.guard_name = '';
  try {
    submitting.value = true;
    const validData = await SystemroleSchema.validate(form.value, { abortEarly: false });
    await systemroleStore.create(validData);
    resetForm();
    document.getElementById('new_system_role_modal').close();
  } catch (err) {
    if (err.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) {
          errors[e.path] = e.message;
        }
      });
    } else if (err.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    }
  } finally {
    submitting.value = false;
  }
};
</script>
