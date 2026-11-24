<template>
  <main class="p-4 sm:p-6">
    <div class="breadcrumbs text-sm">
      <ul>
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li>Training environment</li>
      </ul>
    </div>

    <div v-if="!trainingEnvironmentEnabled" role="alert" class="alert alert-warning alert-soft mt-3">
      <Icon name="lucide:flask-conical-off" class="h-5 w-5" />
      <span>The training environment is disabled. Set <code>TRAINING_ENV=true</code> to enable this facility.</span>
    </div>

    <TrainingSessions
      v-else-if="canAccess"
      class="mt-3"
      :can-add="canAdd"
      :can-delete="canDelete"
    />

    <div v-else role="alert" class="alert alert-error mt-3">
      <Icon name="lucide:shield-alert" class="h-5 w-5" />
      <span>You do not have permission to access training sessions.</span>
    </div>
  </main>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Training environment' });

const store = useTrainingSessionStore();
const { canAccess, canAdd, canDelete, guardPage } = useCheckPermission('trainingsessions');
const runtimeConfig = useRuntimeConfig();
const trainingEnvironmentEnabled = String(runtimeConfig.public.trainingEnvironmentEnabled).toLowerCase() === 'true';

onMounted(async () => {
  if (!trainingEnvironmentEnabled) return;
  const allowed = await guardPage('can.access.trainingsessions');
  if (!allowed) return;
  await store.fetchAll();
});
</script>
