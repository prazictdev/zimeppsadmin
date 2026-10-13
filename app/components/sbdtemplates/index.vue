<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <div>
          <span class="text-lg font-bold">SBD Templates</span>
          <p class="text-xs text-base-content/60">
            A curated, online-only HTML bidding document per procurement group, bound to the data captured in
            steps 1–7. Procuring entities can add their own sections at tender time for anything not covered.
          </p>
        </div>
        <SbdtemplatesAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Procurement group</th>
              <th>Template name</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.items.length">
              <td colspan="5" class="text-center text-base-content/50">No SBD templates yet.</td>
            </tr>
            <tr v-for="(item, i) in store.items" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.procurementgroup?.name ?? '—' }}</td>
              <td>{{ item.name }}</td>
              <td>
                <span :class="['badge badge-sm', item.status === 'ACTIVE' ? 'badge-success' : 'badge-ghost']">
                  {{ item.status }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <SbdtemplatesEdit v-if="canEdit" :item="item" />
                  <SbdtemplatesDelete v-if="canDelete" :item="item" />
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
const store = useSbdTemplateStore();

defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});
</script>
