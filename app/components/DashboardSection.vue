<template>
  <article class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
    <header class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-base-200 text-base-content/65">
          <Icon :name="icon" class="h-5 w-5" />
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-base-content/40">{{ eyebrow }}</p>
          <h2 class="mt-1 text-lg font-bold">{{ title }}</h2>
          <p class="mt-1 text-sm text-base-content/55">{{ description }}</p>
        </div>
      </div>
      <NuxtLink v-if="link" :to="link" class="btn btn-sm btn-ghost">
        {{ linkLabel }}
        <Icon name="lucide:arrow-up-right" class="h-4 w-4" />
      </NuxtLink>
    </header>
    <slot />
  </article>
</template>

<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  link: { type: String, default: '' },
  linkLabel: { type: String, default: '' },
})
</script>
