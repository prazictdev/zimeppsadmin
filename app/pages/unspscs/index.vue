<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>UNSPSC Codes</li>
          </ul>
        </div>
      </div>
    </div>
    <Unspscs v-if="canAccess" :can-add="canAdd" :can-edit="canEdit" :can-delete="canDelete" />
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
useHead({ title: 'UNSPSC Codes' });

const store = useUnspscStore();
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('unspscs');

onMounted(async () => {
  if (canAccess) {
    store.fetchPage(1);
  }
});
</script>
