<template>
  <div>
    <div class="card outline outline-1 outline-base-200 card-xs">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/suppliergroups">Supplier Groups</NuxtLink></li>
            <li>Thresholds</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="canAccess">
      <div class="card mt-3 border border-base-200">
        <div class="card-body pb-2">
          <div class="flex items-center gap-3">
            <Icon name="lucide:layers" class="text-primary" />
            <div>
              <p class="text-xs text-base-content/60">Supplier Group</p>
              <p class="font-bold">{{ groupName }}</p>
            </div>
          </div>
        </div>
      </div>

      <Suppliergroupthresholds
        :suppliergroup-id="suppliergroupId"
        :can-add="canAdd"
        :can-edit="canEdit"
        :can-delete="canDelete"
      />
    </div>

    <div v-else>
      <div role="alert" class="alert alert-error mt-3">
        <Icon name="lucide:alert-circle" />
        <span>You do not have permission to access this page.</span>
      </div>
    </div>

    <Loader :loading="thresholdStore.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Supplier Group Thresholds' });

const route = useRoute();
const suppliergroupId = computed(() => Number(route.params.id));

const thresholdStore = useSupplierGroupThresholdStore();
const sgStore = useSupplierGroupStore();
const pgStore = useProcurementGroupStore();
const pmStore = useProcurementMethodStore();
const currencyStore = useCurrencyStore();

const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('suppliergroupthresholds');

const groupName = computed(() => {
  const found = sgStore.items.find((g) => g.id === suppliergroupId.value);
  return found?.name ?? '';
});

onMounted(async () => {
  if (canAccess) {
    await Promise.all([
      thresholdStore.fetchBySupplierGroup(suppliergroupId.value),
      sgStore.fetchAll(),
      pgStore.fetchAll(),
      pmStore.fetchAll(),
      currencyStore.fetchAll(),
    ]);
  }
});
</script>
