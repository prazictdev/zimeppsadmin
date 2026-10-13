<template>
  <div v-if="payload" class="space-y-5">
    <!-- Report header -->
    <div class="card outline outline-1 outline-base-200">
      <div class="card-body">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">{{ reportTitle }}</h1>
            <p class="mt-1 text-sm text-base-content/60">
              <span v-if="payload.metadata.entity_name">{{ payload.metadata.entity_name }} · </span>
              {{ formatDate(payload.metadata.period.from) }} – {{ formatDate(payload.metadata.period.to) }}
            </p>
          </div>
          <div class="flex flex-col items-end gap-2 text-xs text-base-content/50">
            <span>Generated {{ formatDateTime(payload.metadata.generated_at) }}</span>
            <span class="badge badge-ghost badge-sm gap-1">
              <Icon name="lucide:bot" class="h-3 w-3" />
              {{ payload.metadata.generated_by_model }}
            </span>
            <button class="btn btn-outline btn-xs gap-1" @click="exportReport">
              <Icon name="lucide:download" class="h-3 w-3" />
              Download all (CSV)
            </button>
          </div>
        </div>

        <div v-if="payload.summary_narrative" class="mt-4 rounded-lg bg-base-200/50 p-4">
          <h2 class="mb-1 text-sm font-semibold uppercase tracking-wide text-base-content/60">
            Executive summary
          </h2>
          <p class="text-sm leading-relaxed">{{ payload.summary_narrative }}</p>
        </div>
      </div>
    </div>

    <!-- Section render loop -->
    <div
      v-for="section in sortedSections"
      :key="section.id"
      class="report-section card outline outline-1 outline-base-200"
    >
      <div class="card-body">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-base font-semibold">{{ section.title }}</h2>
          <div v-if="section.data.length" class="no-print flex items-center gap-1">
            <button
              v-if="!isTable(section)"
              class="btn btn-ghost btn-xs gap-1"
              :class="tableView[section.id] ? 'btn-active' : ''"
              @click="toggleTable(section.id)"
            >
              <Icon :name="tableView[section.id] ? 'lucide:chart-column' : 'lucide:table'" class="h-3 w-3" />
              {{ tableView[section.id] ? 'Chart' : 'Table' }}
            </button>
            <button class="btn btn-ghost btn-xs gap-1" @click="exportSection(section)">
              <Icon name="lucide:download" class="h-3 w-3" />
              CSV
            </button>
          </div>
        </div>

        <ReportsDataGrid
          v-if="tableView[section.id] && !isTable(section)"
          :data="section.data"
          :instructions="section.render_instructions"
        />
        <component
          :is="resolveComponent(section.render_instructions.component)"
          v-else-if="resolveComponent(section.render_instructions.component)"
          :data="section.data"
          :instructions="section.render_instructions"
          :narrative="section.narrative"
          :citations="section.citations"
        />
        <div v-else class="alert alert-warning">
          <Icon name="lucide:triangle-alert" />
          <span>Unsupported section type: {{ section.render_instructions.component }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  payload: { type: Object, default: null },
})

const payloadRef = toRef(props, 'payload')
const { sortedSections, resolveComponent } = useRenderAgent(payloadRef)
const { downloadRows, downloadReport, slug } = useCsvExport()

const reportTitle = computed(() => {
  const type = (props.payload?.report_type ?? '').replace(/_/g, ' ')
  return type.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Report'
})

const tableView = reactive({})
const toggleTable = (id) => {
  tableView[id] = !tableView[id]
}

const isTable = (section) => section.render_instructions.component === 'data_table'

const exportSection = (section) => {
  const name = `${slug(props.payload?.report_type)}-${slug(section.id)}.csv`
  downloadRows(name, section.data)
}

const exportReport = () => downloadReport(props.payload)

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '')
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '')
</script>
