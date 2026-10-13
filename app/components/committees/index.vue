<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-base-200 pb-3">
        <div><h1 class="text-lg font-bold">Default Committees</h1><p class="text-sm text-base-content/60">Define committee names and the member evidence required across the system.</p></div>
        <button v-if="canAdd" class="btn btn-success btn-sm" @click="openCreate"><Icon name="lucide:plus" />New committee</button>
      </div>
      <input v-model="search" type="search" class="input input-bordered input-sm mt-4 w-full max-w-sm" placeholder="Search committees…" />
      <div class="mt-3 overflow-x-auto rounded-xl border border-base-200">
        <table class="table table-zebra">
          <thead><tr><th>Name</th><th>Qualifications required</th><th>Work history required</th><th class="text-right">Actions</th></tr></thead>
          <tbody>
            <tr v-if="!filtered.length"><td colspan="4" class="py-10 text-center text-base-content/50">No committee definitions found.</td></tr>
            <tr v-for="item in filtered" :key="item.id">
              <td class="font-medium">{{ item.name }}</td>
              <td><span :class="['badge badge-sm', item.qualifications_required ? 'badge-success' : 'badge-ghost']">{{ item.qualifications_required ? 'Required' : 'Not required' }}</span></td>
              <td><span :class="['badge badge-sm', item.work_history_required ? 'badge-success' : 'badge-ghost']">{{ item.work_history_required ? 'Required' : 'Not required' }}</span></td>
              <td><div class="flex justify-end gap-2"><button v-if="canEdit" class="btn btn-info btn-sm" @click="openEdit(item)"><Icon name="lucide:pencil" />Edit</button><button v-if="canDelete" class="btn btn-error btn-outline btn-sm" @click="confirmDelete(item)"><Icon name="lucide:trash-2" />Delete</button></div></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <dialog ref="formDialog" class="modal"><div class="modal-box"><h3 class="text-lg font-bold">{{ editingId ? 'Edit committee' : 'New committee' }}</h3><form class="mt-4 space-y-4" @submit.prevent="submit"><label class="fieldset"><span class="fieldset-legend">Unique name</span><input v-model="form.name" class="input input-bordered w-full" :class="errors.name ? 'input-error' : ''" placeholder="e.g. Evaluation Committee" /><span v-if="errors.name" class="text-xs text-error">{{ errors.name }}</span></label><label class="flex cursor-pointer items-center justify-between rounded-lg border border-base-200 p-3"><span><strong>Qualifications required</strong><small class="block text-base-content/60">Members must provide qualification records.</small></span><input v-model="form.qualifications_required" type="checkbox" class="toggle toggle-success" /></label><label class="flex cursor-pointer items-center justify-between rounded-lg border border-base-200 p-3"><span><strong>Work history required</strong><small class="block text-base-content/60">Members must provide employment history.</small></span><input v-model="form.work_history_required" type="checkbox" class="toggle toggle-success" /></label><div class="modal-action"><button type="button" class="btn" @click="formDialog.close()">Cancel</button><button class="btn btn-primary" :disabled="saving"><span v-if="saving" class="loading loading-spinner loading-xs" />Save</button></div></form></div><form method="dialog" class="modal-backdrop"><button>close</button></form></dialog>
    <dialog ref="deleteDialog" class="modal"><div class="modal-box"><h3 class="text-lg font-bold">Delete committee</h3><p class="py-4">Delete <strong>{{ deletingItem?.name }}</strong>?</p><div class="modal-action"><button class="btn" @click="deleteDialog.close()">Cancel</button><button class="btn btn-error" :disabled="saving" @click="remove"><span v-if="saving" class="loading loading-spinner loading-xs" />Delete</button></div></div></dialog>
  </div>
</template>

<script setup>
const props = defineProps({ canAdd: Boolean, canEdit: Boolean, canDelete: Boolean });
const store = useCommitteeDefinitionStore();
const search = ref('');
const formDialog = ref(null), deleteDialog = ref(null), editingId = ref(null), deletingItem = ref(null), saving = ref(false);
const blank = () => ({ name: '', qualifications_required: false, work_history_required: false });
const form = reactive(blank()), errors = reactive({ name: '' });
const filtered = computed(() => store.items.filter(item => item.name.toLowerCase().includes(search.value.trim().toLowerCase())));
const reset = (item = null) => { Object.assign(form, item ? { name: item.name, qualifications_required: !!item.qualifications_required, work_history_required: !!item.work_history_required } : blank()); errors.name = ''; };
const openCreate = () => { editingId.value = null; reset(); formDialog.value.showModal(); };
const openEdit = item => { editingId.value = item.id; reset(item); formDialog.value.showModal(); };
const submit = async () => { errors.name = ''; saving.value = true; try { const payload = await CommitteeSchema.validate(form, { abortEarly: false }); const result = await store.save(payload, editingId.value); if (result.ok) formDialog.value.close(); else errors.name = result.error?.data?.errors?.name?.[0] || ''; } catch (error) { for (const issue of error.inner || [error]) if (issue.path === 'name') errors.name = issue.message; } finally { saving.value = false; } };
const confirmDelete = item => { deletingItem.value = item; deleteDialog.value.showModal(); };
const remove = async () => { saving.value = true; try { if (await store.remove(deletingItem.value.id)) deleteDialog.value.close(); } finally { saving.value = false; } };
</script>
