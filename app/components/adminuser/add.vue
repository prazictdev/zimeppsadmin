<template>
    <div>
        <button class="btn btn-sm btn-default " @click="openCreateModal">
                <Icon name="lucide:plus" />
               <span class="hidden md:block ">Add User</span>
              </button>
              <dialog ref="newAdminUserModal" class="modal">
                <div class="modal-box w-10/12 max-w-5xl">
                    <div class="bg-primary p-3 rounded-md text-white flex justify-between">
                        <h3 class="text-lg font-bold">Add User</h3>
                        <button class="btn btn-ghost btn-circle" @click="closeCreateModal">
                            <Icon name="lucide:x" />
                        </button>
                    </div>

                    <form method="dialog" @submit.prevent="handleSubmit">
                        <div class="card border border-base-200 rounded-md mt-3">
                           
                            <div class="card-body">
                                <div class="card-header bg-base-200 p-3  flex justify-between">
                                <h3 class="text-lg font-bold">User Details</h3>
                            </div>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                type="text"
                    v-model="form.name"
                    placeholder="First name"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Last name</span>
              <input
                type="text"
                    v-model="form.lastname"
                    placeholder="Last name"
                :class="['input input-bordered w-full', errors.lastname ? 'input-error' : '']"
              />
              <label v-if="errors.lastname" class="label">
                <span class="label-text-alt text-red-600">{{ errors.lastname }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Gender</span>
              <select
                v-model="form.gender"
                :class="['select select-bordered w-full', errors.gender ? 'select-error' : '']"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
                <label v-if="errors.gender" class="label">
                <span class="label-text-alt text-red-600">{{ errors.gender }}</span>
                </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Middle name</span>
              <input
                type="text"
                    v-model="form.middlename"
                    placeholder="Middle name"
                :class="['input input-bordered w-full', errors.middlename ? 'input-error' : '']"
              />
              <label v-if="errors.middlename" class="label">
                <span class="label-text-alt text-red-600">{{ errors.middlename }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Email</span>
              <input
                type="email"
                v-model="form.email"
                placeholder="Email"
                :class="['input input-bordered w-full', errors.email ? 'input-error' : '']"
              />
              <label v-if="errors.email" class="label">
                <span class="label-text-alt text-red-600">{{ errors.email }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Phone</span>
              <input
                type="tel"
                v-model="form.phone"
                placeholder="Phone"
                :class="['input input-bordered w-full', errors.phone ? 'input-error' : '']"
              />
              <label v-if="errors.phone" class="label">
                <span class="label-text-alt text-red-600">{{ errors.phone }}</span>
              </label>
            </label>
           
          </div>
          </div>
          </div>

         
          <div class="modal-action">
            <button class="btn" type="button" onclick="new_companycategory_modal.close()">
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
const props = defineProps({
    company: {
        type: Object,
        required: true,
    },
});
const emit = defineEmits(['refreshcompany']);
const toast = useToast();
const submitting = ref(false);
const userHelper = useUserHelper();
const form = ref({
    name: '',
    lastname: '',
    gender: '',
    email: '',
    middlename: '',
    phone: '',
    company_id: props?.company?.id ?? '',
});
const errors = reactive({
    name: '',
    lastname: '',
    gender: '',
    email: '',
    middlename: '',
    phone: '',
    middlename: '',
});
const newAdminUserModal = ref(null);
const openCreateModal = () => {
    newAdminUserModal.value.showModal();
}
const closeCreateModal = () => {
    newAdminUserModal.value.close();
}
const handleSubmit = async () => {
    errors.name = '';
    errors.lastname = '';
    errors.gender = '';
    errors.email = '';
    errors.middlename = '';
    errors.phone = '';
    try {
        submitting.value = true;
        form.value.company_id = props.company?.id;
        const validData = await UserSchema.validate(form.value, { abortEarly: false });
       const { ok, data, error } = await userHelper.createUser(validData);
       if (ok) {
        toast.success({
            title: 'User created successfully',
            description: 'User created successfully',
            position: 'topRight',
            layout: 2,
        });
        resetForm();
        emit('refreshcompany');
       }else{
        toast.error({
            title: 'User creation failed',
            description: error,
            position: 'topRight',
            layout: 2,
        });
       }
      
    } catch (err) {
       console.log(err);
        if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) {
          errors[e.path] = e.message;
        }
      });
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    } else {
        toast.error({
            title: 'User creation failed',
            description: err.message,
            position: 'topRight',
            layout: 2,
        });
    }
         
       } finally {
        submitting.value = false;
       }
    

}
const resetForm = () => {
    form.value = {
        name: '',
        lastname: '',
        gender: '',
        email: '',
        middlename: '',
        phone: '',
        company_id: props.company?.id,
    }
}
</script>