<template>
  <div class="space-y-4">
    <div class="card card-xs outline outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Reports</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="canAccess" class="card outline outline-1 outline-base-200">
      <div class="card-body">
        <div class="mb-1 flex items-center gap-2">
          <Icon name="lucide:message-square-text" class="h-5 w-5 text-success" />
          <h1 class="text-lg font-semibold">Report assistant</h1>
        </div>
        <p class="mb-2 text-sm text-base-content/60">
          Ask for a report in plain language. The assistant works out the report type, period and
          entity, then generates it for you.
        </p>
        <ReportsReportChat />
      </div>
    </div>

    <div v-else-if="!loading" class="alert alert-warning">
      <Icon name="lucide:lock" />
      <span>You do not have permission to view reports.</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Reports' })

const { canAccess } = useCheckPermission('reports')
const loading = ref(true)

onMounted(() => {
  loading.value = false
})
</script>
