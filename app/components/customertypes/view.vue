<template>
  <div>
    <button v-if="canAccess" class="btn btn-neutral btn-sm" @click="openModal">
      <Icon name="lucide:eye" />
      <span class="hidden md:block">View</span>
    </button>

    <dialog :id="`view_customertype_modal_${item.id}`" class="modal">
      <div class="modal-box w-11/12 max-w-3xl">

        <!-- Header -->
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-lg font-bold">{{ detail?.name ?? item.name }}</h3>
            <p class="text-sm text-base-content/60">Code: {{ detail?.code ?? item.code }}</p>
          </div>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('view_customertype_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loadingDetail" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <template v-else>
          <!-- Tabs -->
          <div class="tabs tabs-border mt-4">
            <button
              class="tab"
              :class="{ 'tab-active': activeTab === 'documents' }"
              @click="activeTab = 'documents'"
            >
              <Icon name="lucide:file-text" class="mr-1" />
              Documents
              <span class="badge badge-sm ml-2">{{ (detail?.documents ?? []).length }}</span>
            </button>
            <button
              class="tab"
              :class="{ 'tab-active': activeTab === 'categories' }"
              @click="activeTab = 'categories'"
            >
              <Icon name="lucide:tag" class="mr-1" />
              Supplier Categories
              <span
                class="badge badge-sm ml-2"
                :class="assignedCategories.length ? 'badge-warning' : 'badge-ghost'"
              >
                {{ assignedCategories.length ? assignedCategories.length : 'All' }}
              </span>
            </button>
          </div>

          <!-- Documents tab -->
          <div v-show="activeTab === 'documents'" class="pt-4">

            <!-- Assign document form -->
            <div v-if="canAdd" class="mb-4 border border-base-200 rounded-box p-4 bg-base-200/30">
              <p class="text-sm font-semibold mb-1">Assign Document Requirement</p>
              <p class="text-xs text-base-content/60 mb-3">
                A document can be assigned more than once when each assignment uses a different document group.
              </p>
              <div class="flex flex-wrap gap-2 items-start">
                <div class="flex-1 min-w-40">
                  <select
                    v-model="assignForm.document_id"
                    :class="['select select-bordered select-sm w-full', assignErrors.document_id ? 'select-error' : '']"
                  >
                    <option value="">— Document —</option>
                    <option v-for="doc in documentStore.items" :key="doc.id" :value="doc.id">
                      {{ doc.name }}
                    </option>
                  </select>
                  <p v-if="assignErrors.document_id" class="text-red-600 text-xs mt-1">{{ assignErrors.document_id }}</p>
                </div>

                <div>
                  <select
                    v-model="assignForm.locality"
                    :class="['select select-bordered select-sm', assignErrors.locality ? 'select-error' : '']"
                  >
                    <option value="">— Locality —</option>
                    <option value="local">Local</option>
                    <option value="foreign">Foreign</option>
                  </select>
                  <p v-if="assignErrors.locality" class="text-red-600 text-xs mt-1">{{ assignErrors.locality }}</p>
                </div>

                <div class="flex-1 min-w-40">
                  <select
                    v-model="assignForm.documentrequirementgroup_id"
                    class="select select-bordered select-sm w-full"
                  >
                    <option :value="null">— Shared across all document groups —</option>
                    <option v-for="g in requirementGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                  </select>
                </div>

                <button
                  class="btn btn-primary btn-sm"
                  :disabled="assigning"
                  @click="handleAssign"
                >
                  <span v-if="assigning"><span class="loading loading-spinner loading-xs"></span></span>
                  <span v-else><Icon name="lucide:plus" /> Assign</span>
                </button>
              </div>
            </div>

            <!-- Local documents table -->
            <div class="mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-success">Local</span>
                <span class="font-semibold text-sm">Required for Local Companies</span>
              </div>
              <table class="table table-sm table-zebra w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document</th>
                    <th>Req. Group</th>
                    <th v-if="canDelete" class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!localDocs.length">
                    <td :colspan="canDelete ? 4 : 3" class="text-center text-base-content/50">
                      No documents required for local companies.
                    </td>
                  </tr>
                  <tr v-for="(doc, i) in localDocs" :key="doc.id">
                    <td>{{ i + 1 }}</td>
                    <td>{{ doc.document?.name ?? '—' }}</td>
                    <td class="text-sm text-base-content/60">{{ doc.documentrequirementgroup?.name ?? '—' }}</td>
                    <td v-if="canDelete" class="text-right">
                      <button
                        class="btn btn-error btn-xs"
                        :disabled="removingId === doc.id"
                        @click="handleRemove(doc)"
                      >
                        <span v-if="removingId === doc.id"><span class="loading loading-spinner loading-xs"></span></span>
                        <span v-else><Icon name="lucide:trash-2" /></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Foreign documents table -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-info">Foreign</span>
                <span class="font-semibold text-sm">Required for Foreign Companies</span>
              </div>
              <table class="table table-sm table-zebra w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Document</th>
                    <th>Req. Group</th>
                    <th v-if="canDelete" class="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!foreignDocs.length">
                    <td :colspan="canDelete ? 4 : 3" class="text-center text-base-content/50">
                      No documents required for foreign companies.
                    </td>
                  </tr>
                  <tr v-for="(doc, i) in foreignDocs" :key="doc.id">
                    <td>{{ i + 1 }}</td>
                    <td>{{ doc.document?.name ?? '—' }}</td>
                    <td class="text-sm text-base-content/60">{{ doc.documentrequirementgroup?.name ?? '—' }}</td>
                    <td v-if="canDelete" class="text-right">
                      <button
                        class="btn btn-error btn-xs"
                        :disabled="removingId === doc.id"
                        @click="handleRemove(doc)"
                      >
                        <span v-if="removingId === doc.id"><span class="loading loading-spinner loading-xs"></span></span>
                        <span v-else><Icon name="lucide:trash-2" /></span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Supplier categories tab -->
          <div v-show="activeTab === 'categories'" class="pt-4">

            <!-- Assign supplier category form -->
            <div v-if="canAdd" class="mb-4 border border-base-200 rounded-box p-4 bg-base-200/30">
         
              <div class="flex flex-wrap gap-2 items-start">
                <div class="flex-1 min-w-40">
                  <select
                    v-model="assignCategoryForm.suppliercategory_id"
                    :class="['select select-bordered select-sm w-full', assignCategoryErrors.suppliercategory_id ? 'select-error' : '']"
                  >
                    <option value="">— Supplier Category —</option>
                    <option v-for="cat in supplierCategoryStore.items" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                  <p v-if="assignCategoryErrors.suppliercategory_id" class="text-red-600 text-xs mt-1">{{ assignCategoryErrors.suppliercategory_id }}</p>
                </div>

                <button
                  class="btn btn-primary btn-sm"
                  :disabled="assigningCategory"
                  @click="handleAssignCategory"
                >
                  <span v-if="assigningCategory"><span class="loading loading-spinner loading-xs"></span></span>
                  <span v-else><Icon name="lucide:plus" /> Assign</span>
                </button>
              </div>
            </div>

          

            <!-- Supplier categories table -->
            <table class="table table-sm table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Section</th>
                  <th v-if="canDelete" class="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!assignedCategories.length">
                  <td :colspan="canDelete ? 4 : 3" class="text-center text-base-content/50">
                    No restrictions — all supplier categories are accessible.
                  </td>
                </tr>
                <tr v-for="(cat, i) in assignedCategories" :key="cat.id">
                  <td>{{ i + 1 }}</td>
                  <td>{{ cat.suppliercategory?.name ?? '—' }}</td>
                  <td>{{ cat.suppliercategory?.section?.name ?? '—' }}</td>
                  <td v-if="canDelete" class="text-right">
                    <button
                      class="btn btn-error btn-xs"
                      :disabled="removingCategoryId === cat.id"
                      @click="handleRemoveCategory(cat)"
                    >
                      <span v-if="removingCategoryId === cat.id"><span class="loading loading-spinner loading-xs"></span></span>
                      <span v-else><Icon name="lucide:trash-2" /></span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </template>

        <div class="modal-action">
          <button
            class="btn"
            :onclick="`document.getElementById('view_customertype_modal_${item.id}').close()`"
          >Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
});

const { canAccess, canAdd, canDelete } = useCheckPermission('customertypedocuments');

const store = useCustomerTypeStore();
const ctdStore = useCustomerTypeDocumentStore();
const ctscStore = useCustomerTypeSupplierCategoryStore();
const documentStore = useDocumentStore();
const supplierCategoryStore = useSupplierCategoryStore();

const activeTab = ref('documents');
const detail = ref(null);
const loadingDetail = ref(false);

// Document assignment state
const assigning = ref(false);
const removingId = ref(null);
const assignForm = ref({ document_id: '', locality: '', documentrequirementgroup_id: null });
const assignErrors = reactive({ document_id: '', locality: '', documentrequirementgroup_id: '' });
const requirementGroups = ref([]);

// Supplier category assignment state
const assigningCategory = ref(false);
const removingCategoryId = ref(null);
const assignCategoryForm = ref({ suppliercategory_id: '' });
const assignCategoryErrors = reactive({ suppliercategory_id: '' });

const localDocs = computed(() =>
  (detail.value?.documents ?? []).filter((d) => d.locality === 'local'),
);
const foreignDocs = computed(() =>
  (detail.value?.documents ?? []).filter((d) => d.locality === 'foreign'),
);
const assignedCategories = computed(() => detail.value?.suppliercategories ?? []);

const loadDetail = async () => {
  loadingDetail.value = true;
  detail.value = await store.findOne(props.item.id);
  loadingDetail.value = false;
};

const openModal = async () => {
  activeTab.value = 'documents';
  document.getElementById(`view_customertype_modal_${props.item.id}`).showModal();
  const fetchGroups = async () => {
    if (!requirementGroups.value.length) {
      const { getDocumentRequirementGroups } = useDocumentRequirementGroupHelper();
      const { data } = await getDocumentRequirementGroups();
      requirementGroups.value = data?.value?.data ?? [];
    }
  };
  await Promise.all([
    !documentStore.items.length ? documentStore.fetchAll() : Promise.resolve(),
    !supplierCategoryStore.items.length ? supplierCategoryStore.fetchAll() : Promise.resolve(),
    fetchGroups(),
    loadDetail(),
  ]);
};

// Document handlers
const resetAssignForm = () => {
  assignForm.value = { document_id: '', locality: '', documentrequirementgroup_id: null };
  assignErrors.document_id = '';
  assignErrors.locality = '';
  assignErrors.documentrequirementgroup_id = '';
};

const handleAssign = async () => {
  assignErrors.document_id = '';
  assignErrors.locality = '';

  let valid = true;
  if (!assignForm.value.document_id) { assignErrors.document_id = 'Document is required.'; valid = false; }
  if (!assignForm.value.locality)    { assignErrors.locality = 'Locality is required.'; valid = false; }
  if (!valid) return;

  assigning.value = true;
  try {
    const payload = {
      customertype_id:             props.item.id,
      document_id:                 Number(assignForm.value.document_id),
      locality:                    assignForm.value.locality,
      documentrequirementgroup_id: assignForm.value.documentrequirementgroup_id || null,
    };

    await CustomerTypeDocumentSchema.validate(payload, { abortEarly: false });
    await ctdStore.create(payload);
    resetAssignForm();
    await loadDetail();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(assignErrors, e.path)) {
          assignErrors[e.path] = e.message;
        }
      });
    }
  } finally {
    assigning.value = false;
  }
};

const handleRemove = async (doc) => {
  removingId.value = doc.id;
  await ctdStore.remove(doc.id);
  await loadDetail();
  removingId.value = null;
};

// Supplier category handlers
const resetAssignCategoryForm = () => {
  assignCategoryForm.value = { suppliercategory_id: '' };
  assignCategoryErrors.suppliercategory_id = '';
};

const handleAssignCategory = async () => {
  assignCategoryErrors.suppliercategory_id = '';

  if (!assignCategoryForm.value.suppliercategory_id) {
    assignCategoryErrors.suppliercategory_id = 'Supplier category is required.';
    return;
  }

  assigningCategory.value = true;
  try {
    const payload = {
      customertype_id:     props.item.id,
      suppliercategory_id: Number(assignCategoryForm.value.suppliercategory_id),
    };

    await CustomerTypeSupplierCategorySchema.validate(payload, { abortEarly: false });
    await ctscStore.create(payload);
    resetAssignCategoryForm();
    await loadDetail();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(assignCategoryErrors, e.path)) {
          assignCategoryErrors[e.path] = e.message;
        }
      });
    }
  } finally {
    assigningCategory.value = false;
  }
};

const handleRemoveCategory = async (cat) => {
  removingCategoryId.value = cat.id;
  await ctscStore.remove(cat.id);
  await loadDetail();
  removingCategoryId.value = null;
};
</script>
