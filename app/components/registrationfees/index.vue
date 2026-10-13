<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Registration Fees</span>
        <RegistrationfeesAdd v-if="canAdd" :suppliergroup-id="suppliergroupId" />
      </div>

      <div v-if="store.items.length === 0" class="py-4 text-center text-sm text-base-content/60">
        No registration fees defined for this supplier group.
      </div>

      <table v-else class="table w-full">
        <thead>
          <tr class="bg-base-200">
            <th>#</th>
            <th>Locality</th>
            <th>Currency</th>
            <th>Fee</th>
            <th>Inventory Item</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in store.items" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td><span class="badge badge-outline capitalize">{{ item.locality }}</span></td>
            <td><span class="badge badge-outline">{{ item.currency?.code }}</span></td>
            <td class="text-right font-mono">{{ formatNumber(item.fee) }}</td>
            <td>
              <span v-if="item.inventoryitem" class="badge badge-outline badge-sm">{{ item.inventoryitem.name }}</span>
              <span v-else class="text-base-content/40 text-xs">—</span>
            </td>
            <td class="flex justify-end gap-1">
              <RegistrationfeesEdit v-if="canEdit" :item="item" :suppliergroup-id="suppliergroupId" />
              <RegistrationfeesDelete v-if="canDelete" :item="item" :suppliergroup-id="suppliergroupId" />
            </td>
          </tr>
        </tbody>
      </table>
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

const store = useRegistrationFeeStore();

const formatNumber = (value) =>
  Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
</script>
