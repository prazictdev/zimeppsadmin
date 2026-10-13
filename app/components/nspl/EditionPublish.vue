<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:send" />
      <span class="hidden md:block">Publish</span>
    </button>
    <dialog :id="modalId" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Publish NSPL Edition</h3>
          <button class="btn btn-ghost btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Publish <span class="font-bold">{{ item.period }}</span>?
          Once published, prices become the official reference and the edition is locked from edits.
        </p>
        <div class="modal-action">
          <button class="btn" type="button" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
          <button class="btn btn-success" :disabled="submitting" @click="handlePublish">
            <span v-if="submitting">Publishing...</span>
            <span v-else>Publish</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useNsplStore();
const submitting = ref(false);

const modalId = computed(() => `publish_nspl_edition_modal_${props.item.id}`);

const openModal = () => document.getElementById(modalId.value).showModal();

const handlePublish = async () => {
  try {
    submitting.value = true;
    const ok = await store.publishEdition(props.item.id);
    if (ok) document.getElementById(modalId.value).close();
  } finally {
    submitting.value = false;
  }
};
</script>
