<template>
  <div>
    <button
      class="btn btn-warning btn-xs ml-2"
      @click="openPermissions"
    >
      <Icon name="lucide:lock" />
      <span class="hidden md:block">Permissions</span>
    </button>
    <dialog ref="permissionsModalRef" id="permissions_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Permissions</h3>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="createPermission">
        <div class="grid grid-cols-3 gap-0">
  <div class="col-span-2 mb-0">
    <label class="fieldset">
              <input
                type="text"
                v-model="form.name"
                placeholder="Enter module name"
                :class="[
                  'input input-bordered rounded-none w-full',
                  errors.name ? 'input-error' : '',
                ]"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
  </div>
  <button class="btn btn-neutral rounded-none" type="submit" :disabled="submitting">
  <span v-if="submitting">Processing...</span>
  <span v-else>Submit</span>
</button>
</div>
</form>
           <table class="table  table-pin-cols table-pin-rows w-full">
            <thead>
                <tr class="bg-base-200 rounded-md">
                    <th>Name</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="p in permissions" :key="p.id">
                    <td>{{ p.name }}</td>
                    <td class="flex justify-end">
                        <button class="btn btn-error btn-xs" @click="deletePermission(p.id)" :disabled="deleting">
                            <span v-if="deleting">Deleting...</span>
                            <span v-else>Delete</span>
                        </button>
                        <button class="btn btn-warning btn-xs ml-2" @click="editPermission(p.id)" :disabled="editing">
                            <span v-if="editing"> <Icon name="lucide:edit" /> Editing...</span>
                            <span v-else>Edit</span>
                        </button>
                    </td>
                </tr>
                <tr v-if="!permissions || !(permissions.length)">
                    <td colspan="3" class="text-center text-sm text-base-content/60">
                        No permissions found for this submodule.
                    </td>
                </tr>
            </tbody>
           </table>
       
      
      </div>
    </dialog>
    <Loader :loading="loading" />
  </div>
</template>
<script setup>
const props = defineProps({
  submodule: {
    type: Object,
    required: true,
  },
});
const toast = useToast();
const loading = ref(false);
const permissions = ref([]);
const submitting = ref(false);
const deleting = ref(false);
const editing = ref(false);
const permissionsModalRef = ref(null);
const editPermissionId = ref(null);
const form = ref({
  submodule_id: props.submodule.id,
  name: "",
  guard_name: "web",
});
const errors = reactive({
  submodule_id: props.submodule.id,
  name: "",
  guard_name: "web",
});
const closeModal = () => {
  if (import.meta.client && permissionsModalRef.value) {
    permissionsModalRef.value.close();
  }
};

const openPermissions = async () => {
  loading.value = true;
  try {
  
    await getPermissions();
  } finally {
    loading.value = false;
  }
  if (import.meta.client && permissionsModalRef.value) {
    permissionsModalRef.value.showModal();
  }
};
const getPermissions = async () => {
  const { ok, data } = await usePermissionHelper().getPermissions(props.submodule.id);
  console.log('data', data);
  if (ok && data) {
    permissions.value = data?? [];
  }
};
const editPermission = async (id) => {
  editing.value = true;
  const { ok, data } = await usePermissionHelper().editPermission(id);
  if (ok && data) {
    editPermissionId.value = data.value?.id;
    form.value.name = data.value?.name;
    form.value.guard_name = data.value?.guard_name;
    form.value.submodule_id = data.value?.submodule_id;
  }
  editing.value = false;
};
const createPermission = async () => {
  submitting.value = true;
  errors.name = "";
  try {
    const validData = await PermissionSchema.validate(form.value, {
      abortEarly: false,
    });
    const { ok, data } = editPermissionId.value ? await usePermissionHelper().updatePermission(editPermissionId.value, validData) : await usePermissionHelper().createPermission(validData);
    if (ok && data) {
      toast.success({
        title: 'Success',
        message: data?.message,
        position: 'topRight',
      });
      await getPermissions();
      form.value.name = "";
      form.value.guard_name = "web";
      form.value.submodule_id = props.submodule.id;     
      submitting.value = false;
    } else {
      errors.name = data?.message ?? "An error occurred while creating the permission";
      submitting.value = false;
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
const deletePermission = async (id) => {
  deleting.value = true;
  const response = await usePermissionHelper().deletePermission(id);
  if (response.data?.value?.status === "success") {
    await getPermissions();
  }
  deleting.value = false;
};
</script>