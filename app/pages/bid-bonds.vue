<template>
  <div class="space-y-5">
    <header class="rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-700 p-6 text-white shadow-sm"><div class="flex items-center gap-3"><Icon name="lucide:shield-alert" class="h-8 w-8" /><div><h1 class="text-2xl font-bold">Bid-bond oversight</h1><p class="text-sm text-white/70">Paid bonds, maturity exposure and tender award status across procurement entities.</p></div></div></header>
    <div v-if="loading" class="grid place-items-center py-20"><span class="loading loading-spinner loading-lg text-success" /></div>
    <div v-else-if="error" class="alert alert-error"><Icon name="lucide:circle-alert" /><span>{{ error }}</span></div>
    <section v-else class="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div class="overflow-x-auto"><table class="table"><thead><tr><th>Tender</th><th>Entity</th><th>Paid bonds</th><th>Total value</th><th>Maturity</th><th>Award status</th><th>Extension</th></tr></thead><tbody><tr v-for="tender in tenders" :key="tender.uuid"><td><p class="font-semibold">{{ tender.reference || tender.title }}</p><p class="max-w-xs truncate text-xs text-base-content/50">{{ tender.title }}</p></td><td>{{ tender.entity }}</td><td>{{ tender.bond_count }}</td><td class="font-mono">{{ tender.currencies.join(', ') }} {{ money(tender.total_amount) }}</td><td><span class="badge" :class="maturityClass(tender.maturity_status)">{{ date(tender.maturity_date) }}</span><p class="mt-1 text-xs text-base-content/50">{{ maturityText(tender.days_to_maturity) }}</p></td><td><span class="badge badge-outline">{{ tender.award_status }}</span></td><td><span v-if="tender.latest_extension" class="text-xs">{{ tender.latest_extension.status }}<br>{{ tender.latest_extension.paid_bidders }}/{{ tender.latest_extension.bidders }} paid</span><span v-else>—</span></td></tr><tr v-if="!tenders.length"><td colspan="7" class="py-16 text-center text-base-content/50">No paid bid bonds were found.</td></tr></tbody></table></div>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
const api = useBidBondManagement()
const tenders = ref([]), loading = ref(true), error = ref('')
onMounted(async () => { const result = await api.list(); loading.value = false; if (!result.ok) return void (error.value = result.error); tenders.value = result.data?.data?.data ?? [] })
const money = value => Number(value || 0).toLocaleString('en-ZW', { minimumFractionDigits: 2 })
const date = value => value ? new Date(value).toLocaleDateString('en-ZW', { dateStyle: 'medium' }) : '—'
const maturityText = days => days == null ? '—' : days < 0 ? `${Math.abs(days)} day(s) overdue` : `${days} day(s) remaining`
const maturityClass = status => status === 'MATURED' ? 'badge-error' : status === 'DUE_SOON' ? 'badge-warning' : 'badge-success'
useHead({ title: 'Bid-bond Oversight' })
</script>
