<template>
    <div>   
        <div class="card outline outline-1 card-xs outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>Users</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
</template>
<script setup>
definePageMeta({
    layout: 'default'
})
useHead({
    title: 'Users'
})
</script>