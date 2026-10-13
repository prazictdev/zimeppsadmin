<template>
  <div class="p-6">
    <!-- Breadcrumb -->
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Payment Channels</li>
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
    <Paymentchannels
      v-else
      :can-add="canAdd"
      :can-edit="canEdit"
      :can-delete="canDelete"
    />

    <Loader :loading="store.loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Payment Channels' })

const store = usePaymentChannelStore()
const { canAccess, canAdd, canEdit, canDelete } = useCheckPermission('payment-channels')

onMounted(async () => {
  if (canAccess) {
    await store.fetchAll()
  }
})
</script>
