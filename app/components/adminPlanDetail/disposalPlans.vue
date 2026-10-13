<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Disposal Plan</span>
        <span class="text-xs text-base-content/60">{{ store.disposalPlansMeta.total }} item{{ store.disposalPlansMeta.total === 1 ? '' : 's' }}</span>
      </div>

      <div v-if="store.subResourceLoading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <div v-else class="mt-3 overflow-x-auto">
        <table class="table table-sm w-full">
          <thead>
            <tr class="text-left">
              <th>#</th>
              <th>Description</th>
              <th>Category</th>
              <th>Asset No.</th>
              <th>Serial No.</th>
              <th>Location</th>
              <th>Acquired</th>
              <th class="text-right">Useful life</th>
              <th class="text-right">Salvage value</th>
              <th>Target disposal</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!store.disposalPlans.length">
              <td colspan="11" class="text-center text-base-content/50">No disposal items.</td>
            </tr>
            <tr v-for="(d, i) in store.disposalPlans" :key="d.id">
              <td>{{ rowNumber(i) }}</td>
              <td class="max-w-xs truncate" :title="d.description">{{ d.description }}</td>
              <td>{{ d.category }}</td>
              <td class="font-mono text-xs">{{ d.assetnumber || '—' }}</td>
              <td class="font-mono text-xs">{{ d.serialnumber || '—' }}</td>
              <td>{{ d.physicallocation }}</td>
              <td>{{ formatDate(d.acquisitiondate) }}</td>
              <td class="text-right">{{ d.estimatedusefullife }} yr</td>
              <td class="text-right font-mono">{{ formatNum(d.estimatedsalvagevalue) }}</td>
              <td>{{ formatDate(d.targetdisposaldate) }}</td>
              <td>{{ d.disposalreason?.name || '—' }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="store.disposalPlansMeta.last_page > 1" class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-base-content/60">
            Page {{ store.disposalPlansMeta.current_page }} of {{ store.disposalPlansMeta.last_page }} · {{ store.disposalPlansMeta.total }} total
          </div>
          <div class="join">
            <button class="btn btn-sm join-item" :disabled="store.disposalPlansMeta.current_page <= 1 || store.subResourceLoading" @click="store.loadDisposalPlans(planUuid, store.disposalPlansMeta.current_page - 1)">Prev</button>
            <button class="btn btn-sm join-item btn-disabled">{{ store.disposalPlansMeta.current_page }}</button>
            <button class="btn btn-sm join-item" :disabled="store.disposalPlansMeta.current_page >= store.disposalPlansMeta.last_page || store.subResourceLoading" @click="store.loadDisposalPlans(planUuid, store.disposalPlansMeta.current_page + 1)">Next</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ planUuid: { type: String, required: true } });
const store = useAdminPlanStore();

const rowNumber = (i) => ((store.disposalPlansMeta.current_page - 1) * store.disposalPlansMeta.per_page) + i + 1;

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString();
};

const formatNum = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

onMounted(() => store.loadDisposalPlans(props.planUuid, 1));
</script>
