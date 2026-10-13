<template>
  <div>
    <button
      class="btn btn-default"
      v-if="canadd"
      onclick="my_modal_1.showModal()"
    >
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Account Type</span>
    </button>
    <dialog id="my_modal_1" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New accounttypes</h3>
          <button class="btn btn-ghost btn-circle" onclick="my_modal_1.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="form-control">
            <input
              type="text"
              v-model="form.name"
              placeholder="Enter account type name"
              :class="[
                'input input-bordered w-full',
                errors.name ? 'input-error' : '',
              ]"
            />
            <label v-if="errors.name" class="label">
              <span class="label-text-alt text-red-600">{{ errors.name }}</span>
            </label>
          </div>
          <div class="form-control">
            <select v-model="form.status" class="select select-bordered w-full">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <label v-if="errors.status" class="label">
              <span class="label-text-alt text-red-600">{{ errors.status }}</span>
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


const toast = useToast();
const accounttypeStore = useAccounttypeStore();
const {can} = useAbility()
const form = ref({
  name: "",
  status: "ACTIVE",
});

const errors = reactive({
  name: "",
  status: "",
});

const submitting = ref(false);
const canadd = computed(()=>can("can.add.accounttype"));

const resetForm = () => {
  form.value = { name: "", status: "ACTIVE" };
  errors.name = "";
  errors.status = "";
};

const handleSubmit = async () => {
  errors.name = "";

  try {
    submitting.value = true;
    const validData = await AccounttypeSchema.validate(form.value, {
      abortEarly: false,
    });
 
    await accounttypeStore.create(validData);

    resetForm();
    my_modal_1.close();
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