<template>
  <div>
    <button class="btn btn-success btn-sm" @click="openModal">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">Assign Document</span>
    </button>
    <dialog id="new_customertypedocument_modal" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Assign Document to Customer Type</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_customertypedocument_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Customer Type</span>
              <select
                v-model="form.customertype_id"
                :class="['select select-bordered w-full', errors.customertype_id ? 'select-error' : '']"
              >
                <option value="">— Select customer type —</option>
                <option v-for="ct in customerTypeStore.items" :key="ct.id" :value="ct.id">
                  {{ ct.name }}
                </option>
              </select>
              <label v-if="errors.customertype_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.customertype_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Document</span>
              <select
                v-model="form.document_id"
                :class="['select select-bordered w-full', errors.document_id ? 'select-error' : '']"
              >
                <option value="">— Select document —</option>
                <option v-for="doc in documentStore.items" :key="doc.id" :value="doc.id">
                  {{ doc.name }}
                </option>
              </select>
              <label v-if="errors.document_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.document_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Locality</span>
              <select
                v-model="form.locality"
                :class="['select select-bordered w-full', errors.locality ? 'select-error' : '']"
              >
                <option value="">— Select locality —</option>
                <option value="local">Local</option>
                <option value="foreign">Foreign</option>
              </select>
              <label v-if="errors.locality" class="label">
                <span class="label-text-alt text-red-600">{{ errors.locality }}</span>
              </label>
            </label>

            <label class="fieldset">
              <span class="fieldset-legend">Requirement Group <span class="font-normal text-base-content/40">(optional)</span></span>
              <select
                v-model="form.documentrequirementgroup_id"
                :class="['select select-bordered w-full', errors.documentrequirementgroup_id ? 'select-error' : '']"
              >
                <option :value="null">— Select group —</option>
                <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
              <label v-if="errors.documentrequirementgroup_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.documentrequirementgroup_id }}</span>
              </label>
            </label>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_customertypedocument_modal.close()">Close</button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting">Saving...</span>
              <span v-else>Assign</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const store = useCustomerTypeDocumentStore();
const customerTypeStore = useCustomerTypeStore();
const documentStore = useDocumentStore();
const groups = ref([]);

const form = ref({ customertype_id: '', document_id: '', locality: '', documentrequirementgroup_id: null });
const errors = reactive({ customertype_id: '', document_id: '', locality: '', documentrequirementgroup_id: '' });
const submitting = ref(false);

const openModal = async () => {
  if (!customerTypeStore.items.length) await customerTypeStore.fetchAll();
  if (!documentStore.items.length) await documentStore.fetchAll();
  if (!groups.value.length) {
    const { getDocumentRequirementGroups } = useDocumentRequirementGroupHelper();
    const { data } = await getDocumentRequirementGroups();
    groups.value = data?.value?.data ?? [];
  }
  document.getElementById('new_customertypedocument_modal').showModal();
};

const resetForm = () => {
  form.value = { customertype_id: '', document_id: '', locality: '', documentrequirementgroup_id: null };
  errors.customertype_id = '';
  errors.document_id = '';
  errors.locality = '';
  errors.documentrequirementgroup_id = '';
};

const handleSubmit = async () => {
  errors.customertype_id = '';
  errors.document_id = '';
  errors.locality = '';
  try {
    submitting.value = true;
    const valid = await CustomerTypeDocumentSchema.validate(form.value, { abortEarly: false });
    await store.create(valid);
    resetForm();
    document.getElementById('new_customertypedocument_modal').close();
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
