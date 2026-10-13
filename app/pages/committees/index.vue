<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200"><div class="card-body"><div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Committees</li></ul></div></div></div>
    <Committees v-if="canAccess" :can-add="canAdd" :can-edit="canEdit" :can-delete="canDelete" />
    <div v-else class="alert alert-error mt-3"><Icon name="lucide:alert-circle" /><span>You do not have permission to access committee definitions.</span></div>
    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Committees' });
const store = useCommitteeDefinitionStore();
const { can, canAdd, canEdit, canDelete } = useCheckPermission('committees')
const canAccess = computed(() => can('can.access.committes'))
onMounted(() => {
  if (canAccess.value) {
    store.fetchAll()
  }
})
</script>
