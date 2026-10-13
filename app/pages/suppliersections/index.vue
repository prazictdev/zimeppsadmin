<template>
  <div>
    <div class="card outline outline-1 outline-base-200 card-xs">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Supplier Sections</li>
          </ul>
        </div>
      </div>
    </div>
    <Suppliersections />
    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Supplier Sections' });

const store = useSupplierSectionStore();
const { guardPage } = useCheckPermission('suppliersection');

onMounted(async () => {
  await guardPage();
  await store.fetchAll();
});
</script>
