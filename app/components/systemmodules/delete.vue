<template>
    <div>
      <button
        class="btn btn-error btn-sm ml-2"
        @click="retrieveSystemmodule()"
      >
        <Icon name="lucide:trash" />
       <span class="hidden md:block">Delete</span>
      </button>
      <dialog :id="`delete_system_module_modal_${systemmodule.id}`" class="modal">
        <div class="modal-box">
          <div class="flex justify-between">
            <h3 class="text-lg font-bold">Delete system modules</h3>
            <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('delete_system_module_modal_${systemmodule.id}').close()`">
              <Icon name="lucide:x" />
            </button>
          </div>
          <form method="dialog" @submit.prevent="handleSubmit">
            <div class="form-control">
              <p>Are you sure you want to delete this system module: <span class="font-bold">{{ systemmodule?.name }}</span>?</p>
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
  
  

  const systemmoduleStore = useSystemmoduleStore();
  const props = defineProps({
    systemmodule: {
      type: Object,
      required: true,
    },
  });
  
  
  
  
  
  const submitting = ref(false);
  


  const retrieveSystemmodule = async () => {
    const systemmodule = await systemmoduleStore.findOne(props.systemmodule.id);
    document.getElementById(`delete_system_module_modal_${props.systemmodule.id}`).showModal();
   
  };
  
  const handleSubmit = async () => {
  
    try {
      submitting.value = true;

   
      await systemmoduleStore.remove(props.systemmodule.id);
  
   
    document.getElementById(`delete_system_module_modal_${props.systemmodule.id}`).close();
    } catch (err) {
     
    } finally {
      submitting.value = false;
    }
  };
  </script>