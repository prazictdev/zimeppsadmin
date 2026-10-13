<template>
    <button class="btn btn-warning btn-xs ml-2" @click="retrieveAccounttype">
        <Icon name="lucide:eye" />
        <span class="hidden md:block">Show</span>
    </button>
<dialog :id="`accounttype_show_modal_${accounttype.id}`" class="modal">
  <div class="modal-box w-11/12 max-w-5xl">
    <div class="flex justify-between">
        <h3 class="text-lg font-bold">Account type: {{ accounttype.name }}</h3>
        <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
        </button>
    </div>
    <div class="tabs tabs-lift">
  <input
    ref="modulesTabRef"
    type="radio"
    name="my_tabs_2"
    class="tab"
    aria-label="Modules"
    value="modules"
    v-model="activeTab"
  />
  <div class="tab-content border-base-300 bg-base-100 p-10">
    <AccounttypesModules :accounttype="record" @refreshaccounttype="retrieveAccounttype" />
  </div>

  <input
    ref="permissionsTabRef"
    type="radio"
    name="my_tabs_2"
    class="tab"
    aria-label="Roles"
    value="permissions"
    v-model="activeTab"
  />
  <div class="tab-content border-base-300 bg-base-100 p-10">
    <AccounttypesRoles :accounttype="record" @refreshaccounttype="retrieveAccounttype" />
  </div>

</div>
  
   
  </div>
</dialog>
</template>
<script setup>
 const props = defineProps({
    accounttype: {
        type: Object,
        required: true,
    },
});
const record = ref(null);
const activeTab = ref('modules');
const modulesTabRef = ref(null);
const permissionsTabRef = ref(null);
const retrieveAccounttype = async () => {
  const { ok, data } = await useAccounttypeHelper().getAccounttype(props.accounttype.id);
  if (ok) {
    record.value = data;
    showModal();
  }
}
const showModal = () => {
    // Always default to Modules tab when opening
    activeTab.value = 'modules';
    if (modulesTabRef.value) {
      modulesTabRef.value.checked = true;
    }
    if (permissionsTabRef.value) {
      permissionsTabRef.value.checked = false;
    }
    document.getElementById(`accounttype_show_modal_${props.accounttype.id}`).showModal();
    
}
const closeModal = () => {
    document.getElementById(`accounttype_show_modal_${props.accounttype.id}`).close();
}
</script>