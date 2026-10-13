<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <div>
          <span class="text-lg font-bold">SBD Sections</span>
          <p class="text-xs text-base-content/60">
            A shared collection of reusable bidding-document sections. Procuring entities can add any active
            section to a tender and then edit their copy.
          </p>
        </div>
        <SbdsectionsAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.items.length">
              <td colspan="6" class="text-center text-base-content/50">No SBD sections yet.</td>
            </tr>
            <tr v-for="(item, i) in store.items" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.body?.title ?? '—' }}</td>
              <td>
                <span class="badge badge-ghost badge-sm">{{ typeLabel(item.body?.type) }}</span>
              </td>
              <td>
                <span :class="['badge badge-sm', item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost']">
                  {{ item.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <SbdsectionsEdit v-if="canEdit" :item="item" />
                  <SbdsectionsDelete v-if="canDelete" :item="item" />
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
const store = useSbdSectionStore();

defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const typeLabel = (type) => {
  if (type === 'table') return 'Table';
  if (type === 'list') return 'List';
  return 'Label → value';
};
</script>
