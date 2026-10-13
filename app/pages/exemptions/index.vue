<template>
  <div>
    <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Exemption approvals</li></ul></div>
    <section v-if="canAccess" class="card mt-3 border border-base-200"><div class="card-body">
      <div class="border-b border-base-200 pb-3"><h1 class="text-xl font-bold">Exemption approvals</h1><p class="text-sm text-base-content/60">Review procurement entity exemption applications submitted for admin approval.</p></div>
      <div class="mt-3 flex flex-wrap gap-3"><input v-model.trim="search" class="input max-w-sm" placeholder="Search entity, title or year" /><select v-model="status" class="select max-w-xs"><option value="">All statuses</option><option value="PENDING_ADMIN_AUTHORIZATION">Awaiting handler</option><option value="PENDING_MANAGER_REVIEW">Awaiting reviewer</option><option value="PENDING_APPROVER_DECISION">Awaiting approver</option><option value="APPROVED">Approved</option><option value="RETURNED">Returned</option></select></div>
      <div class="overflow-x-auto"><table class="table table-zebra mt-3"><thead><tr><th>Entity</th><th>APP</th><th>Title</th><th>Items</th><th>Status</th><th></th></tr></thead><tbody><tr v-if="!filtered.length"><td colspan="6" class="text-center text-base-content/50">No exemption applications found.</td></tr><tr v-for="row in filtered" :key="row.uuid"><td>{{ row.company?.name || row.plan?.company?.name || '—' }}</td><td>{{ row.plan?.year || '—' }}</td><td class="font-medium">{{ row.title }}</td><td>{{ row.items_count ?? row.items?.length ?? 0 }}</td><td><span class="badge badge-sm" :class="badge(row.status)">{{ format(row.status) }}</span></td><td class="text-right"><NuxtLink :to="`/exemptions/${row.uuid}`" class="btn btn-ghost btn-sm"><Icon name="lucide:eye" /> Review</NuxtLink></td></tr></tbody></table></div>
    </div></section>
    <div v-else-if="ready" class="alert alert-warning mt-3"><Icon name="lucide:lock" /> You do not have permission to view exemptions.</div>
    <div v-if="loading" class="flex justify-center py-10"><span class="loading loading-spinner loading-lg" /></div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Exemption approvals' });
const api = useExemptionHelper();
const { can } = useCheckPermission();
const canAccess = computed(() => can('can.access.exemptions') || can('can.authorize.exemptions'));
const rows = ref([]), loading = ref(false), ready = ref(false), search = ref(''), status = ref('');
const toast = useToast();
const format = value => ({ PENDING_ADMIN_AUTHORIZATION: 'Awaiting handler', PENDING_MANAGER_REVIEW: 'Awaiting reviewer', PENDING_APPROVER_DECISION: 'Awaiting approver' }[value] || String(value || '').replaceAll('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase()));
const badge = value => ({ APPROVED: 'badge-success', RETURNED: 'badge-error', PENDING_ADMIN_AUTHORIZATION: 'badge-info', PENDING_MANAGER_REVIEW: 'badge-info', PENDING_APPROVER_DECISION: 'badge-info' }[value] || 'badge-ghost');
const filtered = computed(() => rows.value.filter(row => { const term = search.value.toLowerCase(); return (!status.value || row.status === status.value) && (!term || [row.title, row.plan?.year, row.company?.name].some(value => String(value || '').toLowerCase().includes(term))); }));
onMounted(async () => { ready.value = true; if (!canAccess.value) return; loading.value = true; const { data, error } = await api.list(); loading.value = false; if (error) toast.error({ title: 'Error', message: error.data?.message || 'Could not load exemption applications.', position: 'topRight', layout: 2 }); else { const payload = data?.data; rows.value = Array.isArray(payload) ? payload : (payload?.data ?? []); } });
</script>
