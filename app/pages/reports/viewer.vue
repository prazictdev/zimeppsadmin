<template>
  <div class="report-viewer space-y-5">
    <div class="no-print card card-xs outline outline-1 outline-base-200">
      <div class="card-body flex-row items-center justify-between">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/reports">Reports</NuxtLink></li>
            <li>Viewer</li>
          </ul>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink to="/reports" class="btn btn-ghost btn-sm">
            <Icon name="lucide:arrow-left" class="h-4 w-4" />
            New report
          </NuxtLink>
          <button v-if="payload" class="btn btn-success btn-sm" @click="printReport">
            <Icon name="lucide:printer" class="h-4 w-4" />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>

    <div v-if="!payload" class="alert alert-info no-print">
      <Icon name="lucide:info" />
      <span>No report loaded. <NuxtLink to="/reports" class="link">Generate one</NuxtLink>.</span>
    </div>

    <ReportsReportRender v-else :payload="payload" />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'

definePageMeta({ layout: 'default' })
useHead({ title: 'Report Viewer' })

const store = useReportStore()
const { payload } = storeToRefs(store)

const printReport = () => window.print()
</script>

<style>
@media print {
  .no-print {
    display: none !important;
  }
  .report-viewer {
    margin: 0;
  }
  .report-section {
    break-inside: avoid;
    page-break-inside: avoid;
    width: 100% !important;
  }
}
</style>
