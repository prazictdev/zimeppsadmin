<template>
  <section class="space-y-4 p-6">
    <nav class="flex flex-wrap items-center gap-1.5 text-sm text-base-content/50" aria-label="Breadcrumb">
      <NuxtLink to="/" class="transition-colors hover:text-base-content">Home</NuxtLink>
      <Icon name="lucide:chevron-right" class="size-3.5" />
      <NuxtLink to="/procurementclasses" class="transition-colors hover:text-base-content">
        Procurement classes
      </NuxtLink>
      <Icon name="lucide:chevron-right" class="size-3.5" />
      <span class="max-w-64 truncate font-medium text-base-content/75">
        {{ store.currentClass?.name ?? 'Class detail' }}
      </span>
    </nav>

    <ProcurementclassesDetail
      v-if="canAccess"
      :class-id="classId"
      :can-add="canAdd"
      :can-edit="canEdit"
      :can-delete="canDelete"
    />
    <div v-else>
      <div role="alert" class="alert alert-error">
        <Icon name="lucide:alert-circle" />
        <span>You do not have permission to access this page.</span>
      </div>
    </div>
    <Loader :loading="store.currentClassLoading || store.thresholdsLoading || store.feesLoading" />
  </section>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const route = useRoute();
const classId = computed(() => Number(route.params.id));

const store = useProcurementClassStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('procurementclasses');

useHead({ title: () => `Procurement Class: ${store.currentClass?.name ?? ''}` });

onMounted(async () => {
  if (!canAccess) return;
  await Promise.all([
    store.fetchClass(classId.value),
    store.fetchThresholdLookups(),
    store.fetchFeeLookups(),
    store.fetchThresholds(classId.value),
    store.fetchFees(classId.value),
  ]);
});
</script>
