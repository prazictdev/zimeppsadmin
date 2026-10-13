<template>
  <div class="overflow-x-auto rounded-lg border border-base-200">
    <table class="table table-zebra table-sm">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column"
            class="cursor-pointer select-none whitespace-nowrap"
            @click="sortBy(column)"
          >
            <span class="inline-flex items-center gap-1">
              {{ humanize(column) }}
              <Icon
                v-if="sortKey === column"
                :name="sortAsc ? 'lucide:arrow-up' : 'lucide:arrow-down'"
                class="h-3 w-3"
              />
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in sortedRows"
          :key="index"
          :class="isHighlighted(row) ? 'bg-warning/10 font-medium' : ''"
        >
          <td v-for="column in columns" :key="column" class="whitespace-nowrap">
            {{ formatCell(row[column]) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Array, default: () => [] },
  instructions: { type: Object, default: () => ({}) },
})

const columns = computed(() => {
  const keys = []
  props.data.forEach((row) => {
    Object.keys(row ?? {}).forEach((key) => {
      if (!keys.includes(key)) keys.push(key)
    })
  })
  return keys
})

const sortKey = ref(null)
const sortAsc = ref(true)

const sortBy = (column) => {
  if (sortKey.value === column) {
    sortAsc.value = !sortAsc.value
  } else {
    sortKey.value = column
    sortAsc.value = true
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.data
  const key = sortKey.value
  return [...props.data].sort((a, b) => {
    const av = a[key]
    const bv = b[key]
    const numeric = typeof av === 'number' && typeof bv === 'number'
    const result = numeric ? av - bv : String(av ?? '').localeCompare(String(bv ?? ''))
    return sortAsc.value ? result : -result
  })
})

const isHighlighted = (row) => {
  const threshold = props.instructions?.highlight_threshold
  if (threshold == null) return false
  return Object.values(row).some((value) => typeof value === 'number' && value > Number(threshold))
}

const humanize = (column) =>
  String(column).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const formatCell = (value) => {
  if (typeof value === 'number') return new Intl.NumberFormat().format(value)
  if (value == null) return '—'
  return value
}
</script>
