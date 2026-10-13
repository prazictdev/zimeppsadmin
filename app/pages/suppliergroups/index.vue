<template>
  <div>
    <div class="card outline outline-1 outline-base-200 card-xs">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Supplier Groups</li>
          </ul>
        </div>
      </div>
    </div>
    <Suppliergroups v-if="canAccess" :can-add="canAdd" :can-edit="canEdit" :can-delete="canDelete" />
    <div v-else>
      <div role="alert" class="alert alert-error mt-3">
  <Icon name="lucide:alert-circle" />
  <span>You do not have permission to access this page.</span>
</div>
    </div>
    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Supplier Groups' });

const store = useSupplierGroupStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('suppliergroups');

onMounted(async () => {
  if(canAccess) {
    await store.fetchAll();
  }
});
</script>
