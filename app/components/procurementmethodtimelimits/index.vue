<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Procurement Method Time Limits</span>
        <ProcurementmethodtimelimitsAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <input v-model="search" type="text" placeholder="Search by method or group..." class="input input-bordered w-full max-w-xs" />
        </div>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Method</th>
              <th>Group</th>
              <th class="text-right">Min Advertising Days</th>
              <th class="text-right">Min Cycle Days</th>
              <th class="text-right">Min Lead Days</th>
              <th>Notes</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="8" class="text-center text-base-content/50">No time limits configured.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.procurementmethod?.name || '—' }}<span v-if="item.procurementmethod?.code" class="ml-1 text-xs text-base-content/60">({{ item.procurementmethod.code }})</span></td>
              <td>{{ item.procurementgroup?.name || '—' }}</td>
              <td class="text-right font-mono">{{ item.minimum_advertising_days ?? '—' }}</td>
              <td class="text-right font-mono">{{ item.minimum_cycle_days ?? '—' }}</td>
              <td class="text-right font-mono">{{ item.minimum_lead_days ?? '—' }}</td>
              <td class="max-w-xs truncate" :title="item.notes">{{ item.notes || '—' }}</td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <ProcurementmethodtimelimitsEdit v-if="canEdit" :item="item" />
                  <ProcurementmethodtimelimitsDelete v-if="canDelete" :item="item" />
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
const store = useProcurementMethodTimelimitStore();
const search = ref('');

defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const filtered = computed(() =>
  store.items.filter((i) => {
    const term = search.value.toLowerCase();
    if (!term) return true;
    return (i.procurementmethod?.name?.toLowerCase().includes(term))
      || (i.procurementmethod?.code?.toLowerCase().includes(term))
      || (i.procurementgroup?.name?.toLowerCase().includes(term));
  }),
);
</script>
