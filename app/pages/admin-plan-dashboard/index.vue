<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Procurement Plans Dashboard</li>
          </ul>
        </div>
      </div>
    </div>

    <AdminPlanDashboard v-if="canAccess" />

    <div v-else-if="!loading" class="alert alert-warning mt-3">
      <Icon name="lucide:lock" />
      <span>You do not have permission to view this dashboard.</span>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Procurement Plans Dashboard' });

const { can } = useCheckPermission();
const loading = ref(true);

const canAccess = computed(() =>
  can('can.review.plans') || can('can.view.recommendations') || can('can.approve.plans'),
);

onMounted(() => {
  loading.value = false;
});
</script>
