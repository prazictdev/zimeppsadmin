<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Customer Type Document Requirements</span>
        <CustomertypedocumentsAdd v-if="canAdd" />
      </div>

      <div class="flex flex-wrap gap-3 mt-2">
        <input
          v-model="search"
          type="text"
          placeholder="Search..."
          class="input input-bordered w-full max-w-xs"
        />
        <select v-model="filterLocality" class="select select-bordered">
          <option value="">All localities</option>
          <option value="local">Local</option>
          <option value="foreign">Foreign</option>
        </select>
      </div>

      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-zebra w-full mt-3">
          <thead>
            <tr>
              <th>#</th>
              <th>Customer Type</th>
              <th>Document</th>
              <th>Requirement Group</th>
              <th>Locality</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="6" class="text-center text-base-content/50">No document requirements found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.customertype?.name ?? '—' }}</td>
              <td>{{ item.document?.name ?? '—' }}</td>
              <td class="text-sm text-base-content/60">{{ item.documentrequirementgroup?.name ?? '—' }}</td>
              <td>
                <span
                  :class="[
                    'badge badge-sm',
                    item.locality === 'local' ? 'badge-success' : 'badge-info',
                  ]"
                >
                  {{ item.locality === 'local' ? 'Local' : 'Foreign' }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <CustomertypedocumentsEdit :item="item" v-if="canEdit" />
                  <CustomertypedocumentsDelete :item="item" v-if="canDelete" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useCustomerTypeDocumentStore();
const search = ref('');
const filterLocality = ref('');

const props = defineProps({
  canAdd:    { type: Boolean, default: false },
  canEdit:   { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const filtered = computed(() =>
  store.items.filter((i) => {
    const matchesSearch =
      i.customertype?.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      i.document?.name?.toLowerCase().includes(search.value.toLowerCase());
    const matchesLocality = filterLocality.value ? i.locality === filterLocality.value : true;
    return matchesSearch && matchesLocality;
  }),
);
</script>
