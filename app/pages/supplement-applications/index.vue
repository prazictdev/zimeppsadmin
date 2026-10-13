<template>
  <div>
    <div class="card card-xs border border-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm"><ul><li><NuxtLink to="/">Home</NuxtLink></li><li>Supplement applications</li></ul></div>
      </div>
    </div>

    <SupplementApplicationsBoard v-if="canAccess" class="mt-4" />
    <div v-else-if="!loading" class="alert alert-warning mt-4"><Icon name="lucide:lock" /><span>You need <code>can.access.adminsupplements</code> to manage supplement applications.</span></div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'Supplement Applications' })

const { can } = useCheckPermission()
const loading = ref(true)
const canAccess = computed(() => can('can.access.adminsupplements'))

onMounted(() => { loading.value = false })
</script>
