<template>
  <div ref="root" class="relative w-full">
    <label class="input input-sm w-full rounded-lg border-base-300 bg-base-100 shadow-none focus-within:border-base-content/30">
      <Icon name="lucide:search" class="h-4 w-4 text-base-content/40" />
      <input
        v-model.trim="query"
        type="search"
        class="grow"
        placeholder="Search customers…"
        aria-label="Search customers"
        autocomplete="off"
        @focus="open = true"
        @keydown.escape="close"
        @keydown.enter.prevent="openFirstResult"
      />
      <span v-if="loading" class="loading loading-spinner loading-xs text-base-content/40" />
      <kbd v-else-if="!query" class="kbd kbd-xs text-base-content/40">/</kbd>
      <button v-else type="button" class="btn btn-ghost btn-circle btn-xs" aria-label="Clear customer search" @click="clear"><Icon name="lucide:x" class="h-3.5 w-3.5" /></button>
    </label>

    <div v-if="showPanel" class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[70] overflow-hidden rounded-xl border border-base-200 bg-base-100 shadow-2xl">
      <header class="flex items-center justify-between border-b border-base-200 px-3 py-2"><span class="text-xs font-semibold uppercase tracking-wide text-base-content/45">Customer results</span><span class="text-xs text-base-content/40">{{ results.length }} found</span></header>
      <button
        v-for="customer in results"
        :key="customer.id"
        type="button"
        class="flex w-full items-start gap-3 border-b border-base-200 px-3 py-3 text-left last:border-b-0 hover:bg-base-200/50"
        @click="openCustomer(customer)"
      >
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">{{ initials(customer.name) }}</span>
        <span class="min-w-0 flex-1"><span class="block truncate text-sm font-semibold">{{ customer.name }}</span><span class="mt-0.5 block truncate font-mono text-xs text-base-content/45">{{ customer.regnumber || 'No registration number' }}</span><span v-if="customer.accounttypes?.length" class="mt-1 block truncate text-xs text-base-content/50">{{ customer.accounttypes.map(type => type.name).join(' · ') }}</span></span>
        <Icon name="lucide:chevron-right" class="mt-2 h-4 w-4 shrink-0 text-base-content/25" />
      </button>
      <div v-if="searched && !loading && !results.length" class="px-4 py-8 text-center"><Icon name="lucide:building-2" class="mx-auto h-6 w-6 text-base-content/20" /><p class="mt-2 text-sm font-semibold">No customers found</p><p class="mt-1 text-xs text-base-content/45">Try a company name or registration number.</p></div>
      <p v-if="query.length === 1" class="px-4 py-5 text-center text-xs text-base-content/45">Enter at least 2 characters to search.</p>
    </div>
  </div>
</template>

<script setup>
const root = ref(null)
const query = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
const open = ref(false)
let debounceTimer
let requestSequence = 0

const showPanel = computed(() => open.value && query.value.length > 0)

watch(query, (value) => {
  clearTimeout(debounceTimer)
  results.value = []
  searched.value = false
  open.value = true
  if (value.length < 2) return
  debounceTimer = setTimeout(() => search(value), 300)
})

async function search(value) {
  const sequence = ++requestSequence
  loading.value = true
  const result = await useCompanyHelper().getCompanies(value, 1, 8)
  if (sequence !== requestSequence) return
  results.value = result.ok ? (result.data?.data ?? []) : []
  searched.value = true
  loading.value = false
}

async function openCustomer(customer) {
  clear()
  await navigateTo(`/companies/${customer.uuid}`)
}

function openFirstResult() {
  if (results.value[0]) openCustomer(results.value[0])
}

function clear() {
  query.value = ''
  results.value = []
  searched.value = false
  open.value = false
}

function close() {
  open.value = false
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || 'C'
}

function handleDocumentClick(event) {
  if (root.value && !root.value.contains(event.target)) close()
}

function handleShortcut(event) {
  if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    event.preventDefault()
    root.value?.querySelector('input')?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleShortcut)
})
</script>
