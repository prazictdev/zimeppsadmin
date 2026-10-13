<template>
  <div class="space-y-5">
    <NuxtLink to="/legacy-archive" class="btn btn-ghost btn-sm"><Icon name="lucide:arrow-left" /> Archive</NuxtLink>
    <div v-if="loading" class="py-20 text-center"><span class="loading loading-spinner loading-lg" /></div>
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>
    <template v-else-if="tender">
      <section class="card border border-base-200 bg-base-100 shadow-sm"><div class="card-body">
        <div class="flex flex-wrap gap-2"><span class="badge badge-outline">{{ tender.source_status }}</span><span class="font-mono text-sm">{{ tender.reference_number }}</span></div>
        <h1 class="text-2xl font-bold">{{ tender.title }}</h1>
        <p>{{ tender.procurement_entity }} · {{ tender.procurement_method }} · closes {{ formatDate(tender.closing_at) }}</p>
      </div></section>
      <section class="card border border-base-200 bg-base-100 shadow-sm"><div class="card-body">
        <h2 class="card-title">Items</h2>
        <div class="overflow-x-auto"><table class="table table-sm"><thead><tr><th>Code</th><th>Item</th><th>Quantity</th><th>Estimate</th></tr></thead>
          <tbody><tr v-for="item in tender.items" :key="item.id"><td>{{ item.item_code }}</td><td>{{ item.name }}</td><td>{{ item.quantity }} {{ item.unit_of_measure }}</td><td>{{ item.estimated_value }}</td></tr></tbody>
        </table></div>
      </div></section>
      <section class="card border border-base-200 bg-base-100 shadow-sm"><div class="card-body">
        <h2 class="card-title">Documents</h2>
        <a v-for="document in tender.documents" :key="document.id" :href="document.docman_url" target="_blank" class="link link-primary block">{{ document.name }} ({{ document.copy_status }})</a>
      </div></section>
    </template>
  </div>
</template>
<script setup>
definePageMeta({ layout: 'default', sanctum: { authOnly: true } })
const route = useRoute()
const archive = useLegacyArchiveHelper()
const tender = ref(null)
const loading = ref(true)
const error = ref('')
onMounted(async () => {
  try { tender.value = (await archive.tender(route.params.uuid)).data }
  catch (exception) { error.value = exception?.data?.message || exception?.message || 'Archived tender was not found.' }
  finally { loading.value = false }
})
const formatDate = (value) => value ? new Date(value).toLocaleString('en-ZW') : '—'
</script>
