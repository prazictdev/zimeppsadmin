<template>
  <div>
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Procurement Entities</li>
          </ul>
        </div>
      </div>
    </div>

    <ProcurementEntities v-if="canAccess" :can-assign="canAssign" :can-remove="canRemove" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'Procurement Entities' });

const { can, guardPage } = useCheckPermission('procuremententities');

const canAccess = computed(() => can('can.access.procuremententities'));
const canAssign = computed(() => can('can.assign.procuremententities'));
const canRemove = computed(() => can('can.remove.procuremententities'));

onMounted(() => guardPage('can.access.procuremententities'));
</script>
