<template>
  <header class="navbar sticky top-0 z-40 border-b border-base-200/70 bg-base-100/90 px-4 py-2 shadow-sm backdrop-blur-md">
    <div class="flex min-w-0 flex-1 items-center gap-2">
      <!-- Sidebar toggle -->
      <button
        class="btn btn-outline btn-circle btn-sm shadow-sm"
        aria-label="Toggle sidebar"
        @click="$emit('toggleSidebar')"
      >
        <Icon name="lucide:layout-grid" class="h-5 w-5" />
      </button>

      <div class="min-w-[7rem] flex-1 md:max-w-md">
        <CustomerSearch />
      </div>
    </div>

    <div class="flex flex-none items-center gap-2">
      <TaskBell />
      <NotificationBell />
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-outline gap-3 rounded-full border border-base-200/80  px-3 normal-case  hover:bg-base-200/60">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="lucide:user" class="h-4 w-4 " />
          </span>
          <span class="hidden text-sm font-medium  lg:block">
            Welcome {{ userName || "Guest" }}
          </span>
          <Icon name="lucide:chevron-down" class="h-4 w-4 text-base-content/60" />
        </label>

        <ul tabindex="0" class="menu dropdown-content z-[60] mt-2 w-56 rounded-box border border-base-200 bg-base-100 p-2 shadow-xl">
          <li>
            <NuxtLink to="/" class="gap-2 rounded-lg">
              <Icon name="lucide:user" />
              Profile
            </NuxtLink>
          </li>
          <li>
            <button class="gap-2 rounded-lg text-error" @click="logout">
              <Icon name="lucide:log-out" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
defineEmits(['toggleSidebar'])

const { user } = useSanctumAuth()
const { logoutUser } = useAuthHelper()

const userName = computed(() => {
  if (!user.value) return ''
  const u = user.value.data.user
  return `${u.name} ${u.lastname}`
})

const logout = async () => {
  const { ok } = await logoutUser()
  if (ok) {
    await navigateTo('/login')
  }
}
</script>
