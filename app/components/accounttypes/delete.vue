<template>
    <div>
      <button
        class="btn btn-error btn-xs ml-2"
        v-if="candelete"
        @click="retrieveAccounttype()"
      >
        <Icon name="lucide:trash" />
        Delete
      </button>
      <dialog :id="`delete_modal_${accounttype.id}`" class="modal">
        <div class="modal-box">
          <div class="flex justify-between">
            <h3 class="text-lg font-bold">Delete accounttypes</h3>
            <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('delete_modal_${accounttype.id}').close()`">
              <Icon name="lucide:x" />
            </button>
          </div>
          <form method="dialog" @submit.prevent="handleSubmit">
            <div class="form-control">
              <p>Are you sure you want to delete this account type: <span class="font-bold">{{ accounttype?.name }}</span>?</p>
            </div>
            <div class="modal-action">
              <button class="btn">Close</button>
              <button class="btn btn-error" type="submit" :disabled="submitting">
                <span v-if="submitting">Deleting...</span>
                <span v-else>Delete</span>
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
  const candelete = computed(()=>can("can.delete.accounttype"));
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
    document.getElementById(`delete_modal_${props.accounttype.id}`).showModal();
    form.value = accounttype;
  };
  
  const handleSubmit = async () => {
    errors.name = "";
  
    try {
      submitting.value = true;

   
      await accounttypeStore.remove(props.accounttype.id);
  
   
    document.getElementById(`delete_modal_${props.accounttype.id}`).close();
    } catch (err) {
     
    } finally {
      submitting.value = false;
    }
  };
  </script>