<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Suspense</li>
          </ul>
        </div>
      </div>
    </div>
    <SuspenseList v-if="canAccess" />
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
useHead({ title: 'Suspense Records' });

const store = useSuspenseStore();
const { canAccess } = useCheckPermission('suspense');

onMounted(async () => {
  if (canAccess) {
    store.fetchAll();
  }
});
</script>
