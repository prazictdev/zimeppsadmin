<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Thresholds</span>
        <SuppliergroupthresholdsAdd
          v-if="canAdd"
          :suppliergroup-id="suppliergroupId"
        />
      </div>

      <div v-if="store.groupedItems.length === 0" class="py-4 text-center text-sm text-base-content/60">
        No thresholds defined for this supplier group.
      </div>

      <div v-for="group in store.groupedItems" :key="group.procurementgroup?.id" class="mt-4">
        <div class="mb-2 flex items-center gap-2">
          <span class="badge badge-primary badge-outline">{{ group.procurementgroup?.code }}</span>
          <span class="font-semibold">{{ group.procurementgroup?.name }}</span>
        </div>

        <table class="table w-full">
          <thead>
            <tr class="bg-base-200">
              <th>#</th>
              <th>Procurement Method</th>
              <th>Currency</th>
              <th>Lower Limit</th>
              <th>Upper Limit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(threshold, index) in group.thresholds" :key="threshold.id">
              <td>{{ index + 1 }}</td>
              <td>{{ threshold.procurementmethod?.name }}</td>
              <td>
                <span class="badge badge-outline">{{ threshold.currency?.code }}</span>
              </td>
              <td class="text-right font-mono">{{ formatNumber(threshold.lower_limit) }}</td>
              <td class="text-right font-mono">{{ formatNumber(threshold.upper_limit) }}</td>
              <td class="flex justify-end gap-1">
                <SuppliergroupthresholdsEdit
                  v-if="canEdit"
                  :item="threshold"
                  :suppliergroup-id="suppliergroupId"
                />
                <SuppliergroupthresholdsDelete
                  v-if="canDelete"
                  :item="threshold"
                  :suppliergroup-id="suppliergroupId"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  suppliergroupId: { type: Number, required: true },
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useSupplierGroupThresholdStore();

const formatNumber = (value) =>
  Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>
