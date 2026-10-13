<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal()">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_system_role_modal_${systemrole.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit system role</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('edit_system_role_modal_${systemrole.id}').close()`">
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
            <button class="btn" type="button" :onclick="`document.getElementById('edit_system_role_modal_${systemrole.id}').close()`">Close</button>
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
const props = defineProps({
  systemrole: { type: Object, required: true },
});
const form = ref({ name: '', guard_name: 'web' });
const errors = reactive({ name: '', guard_name: '' });
const submitting = ref(false);

const openModal = async () => {
  const role = await systemroleStore.findOne(props.systemrole.id);
  if (role) form.value = { ...role };
  document.getElementById(`edit_system_role_modal_${props.systemrole.id}`).showModal();
};

const handleSubmit = async () => {
  errors.name = '';
  errors.guard_name = '';
  try {
    submitting.value = true;
    const validData = await SystemroleSchema.validate(form.value, { abortEarly: false });
    await systemroleStore.update(props.systemrole.id, validData);
    document.getElementById(`edit_system_role_modal_${props.systemrole.id}`).close();
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
