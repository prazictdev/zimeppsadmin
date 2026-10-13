<template>
  <div class="p-6">
    <!-- Breadcrumb -->
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Payment Transactions</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- No permission -->
    <div v-if="!canAccess" role="alert" class="alert alert-error mt-3">
      <Icon name="lucide:alert-circle" />
      <span>You do not have permission to access this page.</span>
    </div>

    <!-- Main component -->
    <Paymenttransactions v-else />

    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Payment Transactions' })

const store = usePaymentTransactionStore()
const { canAccess } = useCheckPermission('paymenttransactions')

onMounted(async () => {
  if (canAccess) {
    const today = new Date()
    const from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const to = today.toISOString().slice(0, 10)
    await store.fetchAll({ from, to })
  }
})
</script>
