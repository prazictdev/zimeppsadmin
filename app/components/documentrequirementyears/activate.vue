<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:check-circle" />
      <span class="hidden md:block">Activate</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Activate Year {{ item.year }}</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Mark <span class="font-bold">{{ item.year }}</span> as the active document requirements year.
          You can still edit items afterwards.
        </p>
        <div class="modal-action">
          <button class="btn" type="button" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
          <button class="btn btn-success" :disabled="submitting" @click="handleActivate">
            <span v-if="submitting">Activating...</span>
            <span v-else>Activate</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useDocumentRequirementYearStore();
const submitting = ref(false);

const modalId = computed(() => `activate_dr_year_modal_${props.item.id}`);
const openModal = () => document.getElementById(modalId.value).showModal();

const handleActivate = async () => {
  try {
    submitting.value = true;
    const ok = await store.activateYear(props.item.id);
    if (ok) document.getElementById(modalId.value).close();
  } finally {
    submitting.value = false;
  }
};
</script>
