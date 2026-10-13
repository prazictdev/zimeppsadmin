<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/nspl">NSPL Editions</NuxtLink></li>
            <li>{{ store.currentEdition?.period ?? '...' }}</li>
          </ul>
        </div>
      </div>
    </div>

    <NsplEditionDetail
      v-if="canAccess"
      :edition-id="editionId"
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
    <Loader :loading="store.editionLoading || store.productsLoading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });

const route = useRoute();
const editionId = computed(() => Number(route.params.id));

const store = useNsplStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('nsplrequirements');

useHead({ title: () => `NSPL: ${store.currentEdition?.period ?? 'Edition'}` });

onMounted(async () => {
  if (!canAccess) return;
  await Promise.all([
    store.fetchEdition(editionId.value),
    store.fetchCategories(),
    store.fetchDivisions(editionId.value),
    store.fetchProductsPage(editionId.value, 1),
  ]);
});
</script>
