<template>
    <div>
        <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li><NuxtLink to="/systemmodules">Modules</NuxtLink></li>
            <li>{{ systemmodule?.name || "" }}</li>
          </ul>
        </div>
      </div>
        </div>

       <Systemsubmodules :systemmodule="systemmodule" :loading="loading" @refresh="fetchSystemmodule" />
       <Loader :loading="loading" />
    </div>
</template>
<script setup>
definePageMeta({
    layout: 'default'
})
useHead({
    title: 'System submodules'
})
const route = useRoute()
const id = route.params.id


const systemmoduleStore = useSystemmoduleStore()
const systemmodule = ref(null)
const loading = ref(false)
const fetchSystemmodule = async () => {
    loading.value = true
    const payload = await systemmoduleStore.findOne(id)
    systemmodule.value = payload
    loading.value = false
}



onMounted(async () => {
    await fetchSystemmodule()
})
</script>