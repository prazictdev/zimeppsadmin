<template>
  <div>
    <div class="card outline outline-1 outline-base-200 card-xs">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Supplier Categories</li>
          </ul>
        </div>
      </div>
    </div>
    <Suppliercategories v-if="canAccess" :can-add="canAdd" :can-edit="canEdit" :can-delete="canDelete" />
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
useHead({ title: 'Supplier Categories' });

const store = useSupplierCategoryStore();
const { guardPage, canAccess, canAdd, canEdit, canDelete } = useCheckPermission('suppliercategory');

onMounted(async () => {
  const canAccess = await guardPage();
  if(canAccess) {
    store.fetchAll();
  }
});
</script>
