import { defineAsyncComponent } from 'vue'

/**
 * Maps a payload's `render_instructions.component` key to the Vue component
 * that renders it. New section types are added here only — the RenderAgent and
 * viewer page stay untouched.
 */
const componentRegistry = {
  bar_chart: defineAsyncComponent(() => import('~/components/reports/sections/BarChartSection.vue')),
  line_chart: defineAsyncComponent(() => import('~/components/reports/sections/LineChartSection.vue')),
  pie_chart: defineAsyncComponent(() => import('~/components/reports/sections/PieChartSection.vue')),
  kpi_cards: defineAsyncComponent(() => import('~/components/reports/sections/KpiCardsSection.vue')),
  data_table: defineAsyncComponent(() => import('~/components/reports/sections/DataTableSection.vue')),
  flag_list: defineAsyncComponent(() => import('~/components/reports/sections/FlagListSection.vue')),
  timeline: defineAsyncComponent(() => import('~/components/reports/sections/TimelineSection.vue')),
}

export const useReportRegistry = () => ({ componentRegistry })
