<template>
    <div>
      <button
        class="btn btn-info btn-sm"
        @click="retrieveSystemmodule()"
      >
        <Icon name="lucide:edit" />
        <span class="hidden md:block">Edit</span>
      </button>
      <dialog :id="`edit_system_module_modal_${systemmodule.id}`" class="modal">
        <div class="modal-box">
          <div class="flex justify-between">
            <h3 class="text-lg font-bold">Edit system modules</h3>
            <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('edit_system_module_modal_${systemmodule.id}').close()`">
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
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
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
  
  

  const systemmoduleStore = useSystemmoduleStore();
  const props = defineProps({
    systemmodule: {
      type: Object,
      required: true,
    },
  });
  
  const form = ref({
    name: "",
    icon: "",
    default_permission: "",
    status: "ACTIVE",
  });
  
  const errors = reactive({
    name: "",
    icon: "",
    default_permission: "",
    status: "",
  });
  
  const submitting = ref(false);
  
  const resetForm = () => {
    form.name.value = "";
    form.icon.value = "";
    form.default_permission.value = "";
    form.status.value = "active";
    errors.name = "";
    errors.icon = "";
    errors.default_permission = "";
    errors.status = "";
  };

  const retrieveSystemmodule = async () => {
    const systemmodule = await systemmoduleStore.findOne(props.systemmodule.id);
    document.getElementById(`edit_system_module_modal_${props.systemmodule.id}`).showModal();
    form.value = systemmodule;
  };
  
  const handleSubmit = async () => {
    errors.name = "";
    errors.icon = "";
    errors.default_permission = "";
    errors.status = "";
  
    try {
      submitting.value = true;
      const validData = await SystemmoduleSchema.validate(form.value, {
        abortEarly: false,
      });
   
      await systemmoduleStore.update(props.systemmodule.id, validData);
  
      resetForm();
      document.getElementById(`edit_system_module_modal_${props.systemmodule.id}`).close();
    } catch (err) {
    
    } finally {
      submitting.value = false;
    }
  };
  </script>