<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_inventoryitem_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit Inventory Item</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_inventoryitem_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Office Chair"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">GL Code</span>
              <input
                v-model="form.glcode"
                type="text"
                placeholder="e.g. 1234-56"
                :class="['input input-bordered w-full', errors.glcode ? 'input-error' : '']"
              />
              <label v-if="errors.glcode" class="label">
                <span class="label-text-alt text-red-600">{{ errors.glcode }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Bank Account Type</span>
              <select
                v-model="form.bankaccounttype_id"
                class="select select-bordered w-full"
              >
                <option :value="null">— None —</option>
                <option v-for="bat in batStore.items" :key="bat.id" :value="bat.id">
                  {{ bat.name }}
                </option>
              </select>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Status</span>
              <select
                v-model="form.status"
                :class="['select select-bordered w-full', errors.status ? 'select-error' : '']"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <label v-if="errors.status" class="label">
                <span class="label-text-alt text-red-600">{{ errors.status }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_inventoryitem_modal_${item.id}').close()`"
            >
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
const props = defineProps({ item: { type: Object, required: true } });
const store = useInventoryItemStore();
const batStore = useBankAccountTypeStore();

onMounted(() => {
  if (!batStore.items.length) batStore.fetchAll();
});

const form = ref({ name: '', glcode: '', status: 'ACTIVE', bankaccounttype_id: null });
const errors = reactive({ name: '', glcode: '', status: '' });
const submitting = ref(false);

const openModal = async () => {
  const data = await store.findOne(props.item.id);
  if (data) {
    form.value = {
      name: data.name ?? '',
      glcode: data.glcode ?? '',
      status: data.status ?? 'ACTIVE',
      bankaccounttype_id: data.bankaccounttype_id ?? null,
    };
  }
  document.getElementById(`edit_inventoryitem_modal_${props.item.id}`).showModal();
};

const handleSubmit = async () => {
  errors.name = '';
  errors.glcode = '';
  errors.status = '';
  try {
    submitting.value = true;
    const valid = await InventoryItemSchema.validate(form.value, { abortEarly: false });
    await store.update(props.item.id, valid);
    document.getElementById(`edit_inventoryitem_modal_${props.item.id}`).close();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) errors[e.path] = e.message;
      });
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    }
  } finally {
    submitting.value = false;
  }
};
</script>
