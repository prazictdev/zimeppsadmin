<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Procurement law library</li>
          </ul>
        </div>
      </div>
    </div>
    <Procurementlaw v-if="canAccess" :can-add="canAdd" :can-edit="canEdit" :can-delete="canDelete" />
    <div v-else class="alert alert-error mt-3">
      <Icon name="lucide:alert-circle" />
      <span>You do not have permission to access this page.</span>
    </div>
    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Procurement law library' });

const store = useProcurementLawStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('procurementlaw');

onMounted(async () => {
  if (canAccess) await store.fetchAll();
});
</script>
