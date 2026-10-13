<template>
  <ReportsSectionShell
    :narrative="narrative"
    :citations="citations"
    :instructions="instructions"
    :is-empty="!data.length"
  >
    <div class="h-72">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
  </ReportsSectionShell>
</template>

<script setup>
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, required: true },
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
})

const { palette } = useChartTheme()

const labelKey = computed(() => props.instructions.color_by ?? Object.keys(props.data[0] ?? {})[0])
const valueKey = computed(() => props.instructions.y_axis ?? Object.keys(props.data[0] ?? {})[1])

const chartData = computed(() => {
  const base = palette()
  const values = props.data.map((row) => Number(row[valueKey.value] ?? 0))
  return {
    labels: props.data.map((row) => row[labelKey.value]),
    datasets: [
      {
        data: values,
        backgroundColor: values.map((_, index) => base[index % base.length]),
        borderWidth: 0,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'right' } },
}
</script>
