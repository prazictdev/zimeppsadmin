<template>
  <div>
    <button
      class="btn btn-default"
      onclick="new_system_submodule_modal.showModal()"
    >
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New  Submodule</span>
    </button>
    <dialog id="new_system_submodule_modal" class="modal"> 
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New system submodule</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_system_submodule_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-2">
            <label class="fieldset">
          
            <input
              type="text"
              v-model="form.name"
              placeholder="Enter module name"
              :class="[
                'input input-bordered w-full',
                errors.name ? 'input-error' : '',
              ]"
            />
            <label v-if="errors.name" class="label">
              <span class="label-text-alt text-red-600">{{ errors.name }}</span>
            </label>
            </label>
            <label class="fieldset">
          
          <input
            type="text"
            v-model="form.url"
            placeholder="Enter url"
            :class="[
              'input input-bordered w-full',
              errors.url ? 'input-error' : '',
            ]"
          />
<label v-if="errors.url" class="label">
              <span class="label-text-alt text-red-600">{{ errors.url }}</span>
            </label>
          </label>
          <label class="fieldset col-span-2">
            <input
              type="text"
              v-model="form.description"
              placeholder="Description (optional)"
              class="input input-bordered w-full"
            />
          </label>
          <label class="fieldset">
            <input
              type="text"
              v-model="form.icon"
              placeholder="Enter icon"
              :class="[
                'input input-bordered w-full',
                errors.icon ? 'input-error' : '',
              ]"
            />
            <label v-if="errors.icon" class="label">
              <span class="label-text-alt text-red-600">{{ errors.icon }}</span>
            </label>
          </label>
          <label class="fieldset">
            <input
              type="text"
              v-model="form.default_permission"
              placeholder="Enter permission"
              :class="[
                'input input-bordered w-full',
                errors.default_permission ? 'input-error' : '',
              ]"
            />
            <label v-if="errors.default_permission" class="label">
              <span class="label-text-alt text-red-600">{{ errors.default_permission }}</span>
            </label>
          </label>
          <label class="fieldset">
            <select
              v-model="form.status"
              class="select select-bordered w-full"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <label v-if="errors.status" class="label">
              <span class="label-text-alt text-red-600">{{ errors.status }}</span>
            </label>
          </label>
          </div>
          <div class="modal-action">
            <button class="btn">Close</button>
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

const systemsubmoduleStore = useSystemsubmoduleStore();
 const emit = defineEmits(['refresh']);
const props = defineProps({
  module_id: {
    type: Number,
    required: true,
  },
});

const form = ref({
  module_id: props.module_id,
  name: "",
  url: "",
  icon: "",
  description: "",
  default_permission: "",
  status: "ACTIVE",
});

const errors = reactive({
  name: "",  
  icon: "",
  url: "",
  default_permission: "",
  status: "",
});

const submitting = ref(false);

const resetForm = () => {
  form.value = {
    module_id: props.module_id,
    name: "",
    url: "",
    icon: "",
    description: "",
    default_permission: "",
    status: "ACTIVE",
  };
  errors.name = "";
  errors.url = "";
  errors.icon = "";
  errors.default_permission = "";
  errors.status = "";
};

const handleSubmit = async () => {
  errors.name = "";
  errors.url = "";
  errors.icon = "";
  errors.default_permission = "";
  errors.status = "";

  try {
    submitting.value = true;
    const payload = { ...form.value, module_id: props.module_id };
    const validData = await SystemsubmoduleSchema.validate(payload, {
      abortEarly: false,
    });
    const response = await systemsubmoduleStore.create(validData);
    if (response) {
      resetForm();
      emit('refresh');
    } 
  } catch (err) {
    if (err.inner && Array.isArray(err.inner)) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) {
          errors[e.path] = e.message;
        }
      });
    } else if (
      err.path &&
      Object.prototype.hasOwnProperty.call(errors, err.path)
    ) {
      errors[err.path] = err.message;
    } else {
      console.error(err);
    }
  } finally {
    submitting.value = false;
  }
};
</script>