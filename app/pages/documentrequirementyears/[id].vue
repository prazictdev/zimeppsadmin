<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/documentrequirementyears">Document Requirements (Yearly)</NuxtLink></li>
            <li>{{ store.currentYear?.year ?? '...' }}</li>
          </ul>
        </div>
      </div>
    </div>

    <DocumentrequirementyearsDetail
      v-if="canAccess"
      :year-id="yearId"
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
    <Loader :loading="store.yearLoading || store.itemsLoading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const route = useRoute();
const yearId = computed(() => Number(route.params.id));

const store = useDocumentRequirementYearStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('documentrequirementyears');

useHead({ title: () => `Document Requirements ${store.currentYear?.year ?? ''}` });

onMounted(async () => {
  if (!canAccess) return;
  await Promise.all([
    store.fetchYear(yearId.value),
    store.fetchLookups(),
    store.fetchItemsPage(yearId.value, 1),
  ]);
});
</script>
