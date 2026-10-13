<template><div class="p-6"><div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Exemption Types</li></ul></div><Exemptiontypes v-if="canAccess" :can-add="canAdd" :can-edit="canEdit" :can-delete="canDelete" /><div v-else class="alert alert-error mt-3"><Icon name="lucide:lock" /> You do not have permission to access exemption types.</div><Loader :loading="store.loading" /></div></template>
<script setup>
definePageMeta({ layout: 'default' }); useHead({ title: 'Exemption Types' });
const store = useExemptionTypeStore(); const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('exemptiontypes');
onMounted(() => { if (canAccess.value) store.fetchAll(); });
</script>
