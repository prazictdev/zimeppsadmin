<template>
    <div>
      <button
        class="btn btn-info btn-xs ml-2"
        v-if="canedit"
        @click="retrieveAccounttype()"
      >
        <Icon name="lucide:edit" />
        Edit
      </button>
      <dialog :id="`edit_modal_${accounttype.id}`" class="modal">
        <div class="modal-box">
          <div class="flex justify-between">
            <h3 class="text-lg font-bold">Edit accounttypes</h3>
            <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('edit_modal_${accounttype.id}').close()`">
              <Icon name="lucide:x" />
            </button>
          </div>
          <form method="dialog" @submit.prevent="handleSubmit">
            <div class="form-control">
              <input
                type="text"
                v-model="form.name"
                placeholder="Enter your name"
                :class="[
                  'input input-bordered w-full',
                  errors.name ? 'input-error' : '',
                ]"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </div>
            <div class="form-control mt-2">
              <select
                v-model="form.status"
                class="select select-bordered w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
  
  
  const {can} = useAbility()
  const accounttypeStore = useAccounttypeStore();
  const props = defineProps({
    accounttype: {
      type: Object,
      required: true,
    },
  });

  const canedit = computed(()=>can("can.edit.accounttype"));
  
  const form = ref({
    name: "",
    status: "active",
  });
  
  const errors = reactive({
    name: "",
  });
  
  const submitting = ref(false);
  
  const resetForm = () => {
    form.name.value = "";
    errors.name = "";
  };

  const retrieveAccounttype = async () => {
    const accounttype = await accounttypeStore.findOne(props.accounttype.id);
    document.getElementById(`edit_modal_${props.accounttype.id}`).showModal();
    form.value = accounttype;
  };
  
  const handleSubmit = async () => {
    errors.name = "";
  
    try {
      submitting.value = true;
      const validData = await AccounttypeSchema.validate(form.value, {
        abortEarly: false,
      });
   
      await accounttypeStore.update(props.accounttype.id, validData);
  
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