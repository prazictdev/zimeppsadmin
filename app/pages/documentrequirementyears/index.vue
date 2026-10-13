<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Document Requirements (Yearly)</li>
          </ul>
        </div>
      </div>
    </div>

    <Documentrequirementyears
      v-if="canAccess"
      :can-add="canAdd"
      :can-edit="canEdit"
      :can-delete="canDelete"
    />
    <div v-else>
      <div role="alert" class="alert alert-error mt-3">
        <Icon name="lucide:alert-circle" />
        <span>You do not have permission to access this page.</span>
      </div>
    </div>
    <Loader :loading="store.yearsLoading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Document Requirements (Yearly)' });

const store = useDocumentRequirementYearStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('documentrequirementyears');

onMounted(async () => {
  if (canAccess) await store.fetchYearsPage(1);
});
</script>
