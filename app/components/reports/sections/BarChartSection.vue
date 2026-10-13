<template>
  <ReportsSectionShell
    :narrative="narrative"
    :citations="citations"
    :instructions="instructions"
    :is-empty="!data.length"
  >
    <div class="h-72">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </ReportsSectionShell>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, required: true },
  narrative: { type: String, default: '' },
  citations: { type: Array, default: () => [] },
})

const { colorsFor } = useChartTheme()

const xKey = computed(() => props.instructions.x_axis ?? Object.keys(props.data[0] ?? {})[0])
const yKey = computed(() => props.instructions.y_axis ?? Object.keys(props.data[0] ?? {})[1])

const chartData = computed(() => {
  const labels = props.data.map((row) => row[xKey.value])
  const values = props.data.map((row) => Number(row[yKey.value] ?? 0))
  return {
    labels,
    datasets: [
      {
        label: yKey.value,
        data: values,
        backgroundColor: colorsFor(values, props.instructions.highlight_threshold),
        borderRadius: 4,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
}
</script>
