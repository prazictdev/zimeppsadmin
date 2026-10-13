<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Supplier Groups</span>
        <SuppliergroupsAdd v-if="canAdd" />
      </div>

      <input
        v-model="search"
        type="text"
        class="input input-sm"
        placeholder="Search groups..."
      />

      <table class="table w-full">
        <thead>
          <tr class="bg-base-200">
            <th>#</th>
            <th>Code</th>
            <th>Name</th>
            <th>Accessible</th>
            <th>Rank</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in filtered" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td><span class="badge badge-outline">{{ item.code }}</span></td>
            <td>{{ item.name }}</td>
            <td>{{ item.accessible }}</td>
            <td>{{ rankLabel(item.rank) }}</td>
            <td class="flex justify-end gap-2">
              <NuxtLink :to="`/suppliergroupthresholds/${item.id}`" class="btn btn-sm btn-outline">
                <Icon name="lucide:sliders-horizontal" />
                <span class="hidden md:block">Thresholds</span>
              </NuxtLink>
              <NuxtLink :to="`/registrationfees/${item.id}`" class="btn btn-sm btn-outline">
                <Icon name="lucide:receipt" />
                <span class="hidden md:block">Fees</span>
              </NuxtLink>
              <SuppliergroupsEdit :item="item" v-if="canEdit" />
              <SuppliergroupsDelete :item="item" v-if="canDelete" />
            </td>
          </tr>
          <tr v-if="!filtered.length">
            <td colspan="6" class="text-center text-sm text-base-content/60">No groups found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const store = useSupplierGroupStore();
const search = ref('');

const RANK_LABELS = { 1: 'SMME', 2: 'ME', 3: 'Other' };
const rankLabel = (rank) => RANK_LABELS[rank] ?? '-';

const props = defineProps({
  canAdd: {
    type: Boolean,
    default: false,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
});
const filtered = computed(() =>
  (store.items ?? []).filter(
    (i) =>
      i.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      i.code?.toLowerCase().includes(search.value.toLowerCase()),
  ),
);
</script>
