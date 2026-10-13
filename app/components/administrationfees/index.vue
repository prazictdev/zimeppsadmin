<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Administration Fees</span>
        <AdministrationfeesAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search by group or description..."
            class="input input-bordered w-full max-w-xs"
          />
          <select v-model="participantFilter" class="select select-bordered max-w-xs">
            <option value="">All participants</option>
            <option value="Domestic">Domestic</option>
            <option value="International">International</option>
          </select>
        </div>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Procurement group</th>
              <th>Participant</th>
              <th>Currency</th>
              <th class="text-right">Amount</th>
              <th>Description</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="7" class="text-center text-base-content/50">No administration fees found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.procurementgroup?.name ?? '—' }}</td>
              <td>
                <span class="badge badge-ghost badge-sm">{{ item.participant }}</span>
              </td>
              <td>{{ item.currency?.code ?? '—' }}</td>
              <td class="text-right font-mono">{{ formatAmount(item.amount) }}</td>
              <td class="max-w-[260px] truncate" :title="item.description">{{ item.description || '—' }}</td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <AdministrationfeesEdit v-if="canEdit" :item="item" />
                  <AdministrationfeesDelete v-if="canDelete" :item="item" />
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
const store = useAdministrationFeeStore();
const search = ref('');
const participantFilter = ref('');

defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const formatAmount = (amount) => {
  const n = Number(amount ?? 0);
  return Number.isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—';
};

const filtered = computed(() =>
  store.items.filter((i) => {
    const q = search.value.toLowerCase().trim();
    const matchesSearch =
      !q ||
      i.procurementgroup?.name?.toLowerCase().includes(q) ||
      i.procurementgroup?.code?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q);
    const matchesParticipant = !participantFilter.value || i.participant === participantFilter.value;
    return matchesSearch && matchesParticipant;
  }),
);
</script>
