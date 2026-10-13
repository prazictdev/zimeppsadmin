<template>
  <div class="p-3 lg:p-4">
    <!-- Breadcrumb -->
    <div class="mb-2 px-1">
        <div class="breadcrumbs text-xs text-base-content/50">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/registrations">Registrations</NuxtLink></li>
            <li>Suppliers</li>
          </ul>
      </div>
    </div>

    <div v-if="!canAccess && !canProcess" role="alert" class="alert alert-error mt-3">
      <Icon name="lucide:alert-circle" />
      <span>You do not have permission to access this page.</span>
    </div>

    <RegistrationsSuppliers
      v-else
      :canProcess="canProcess"
      :can-assign="canAssign"
    />

    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Supplier Registrations' })

const store = useRegistrationStore()
const route = useRoute()
const { canAccess, canProcess, can } = useCheckPermission('supplierregistrations')
const canAssign = computed(() => can('can.assign.supplierregistrations'))

onMounted(async () => {
  if (canAccess.value || canProcess.value) {
    const requestedYear = Number(route.query.year)
    await store.fetchAll({
      year: Number.isInteger(requestedYear) && requestedYear >= 2000 ? requestedYear : new Date().getFullYear(),
      company: route.query.company || undefined,
    })
  }
})
</script>
