<template>
  <div class="flex h-full flex-col">
    <!-- Sidebar header -->
    <div class="flex min-h-20 items-center justify-between border-b border-base-300 px-4 py-3">
      <NuxtLink to="/" class="flex min-w-0 items-center gap-3" @click="$emit('close')">
        <img
          v-if="showLogoImage"
          :src="imgUrl"
          alt="Zimbabwe national emblem"
          class="h-11 w-11 shrink-0 object-contain"
          @error="onLogoError"
        />
        <div class="flex min-w-0 flex-col leading-tight">
          <span class="truncate text-sm font-bold text-base-content">ZimEpps Admin</span>
          <span class="text-[10px] font-medium uppercase tracking-wide text-base-content/60">Administration portal</span>
        </div>
      </NuxtLink>

      <!-- Close button — mobile only -->
      <button
        class="btn btn-ghost btn-sm lg:hidden"
        aria-label="Close sidebar"
        @click="$emit('close')"
      >
        <Icon name="lucide:x" class="h-4 w-4" />
      </button>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <ul class="menu w-full gap-1 p-0">
        <li>
          <NuxtLink
            to="/"
            :class="['gap-2 rounded-md', route.path === '/' ? 'bg-accent text-accent-content' : '']"
            @click="$emit('close')"
          >
            <Icon name="lucide:home" class="h-4 w-4 shrink-0" />
            <span>Home</span>
          </NuxtLink>
        </li>

        <li v-for="module in visibleModules" :key="module.id" class="mt-1">
          <details :open="module.submodules.some(submodule => route.path.startsWith(submodule.url))">
            <summary class="gap-2 rounded-lg font-medium">
              <Icon :name="module.icon" class="h-4 w-4 shrink-0" />
              {{ module.name }}
            </summary>
            <ul class="mt-1">
              <li v-for="submodule in module.submodules" :key="submodule.id">
                <NuxtLink
                  :to="submodule.url"
                  :class="['gap-2 rounded-md text-sm', route.path === submodule.url ? 'bg-accent text-accent-content' : '']"
                  @click="$emit('close')"
                >
                  <Icon :name="submodule.icon" class="h-4 w-4 shrink-0" />
                  {{ submodule.name }}
                </NuxtLink>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </nav>

    <!-- Sidebar footer -->
    <div class="border-t border-base-200 px-4 py-3">
      <button class="btn btn-ghost btn-sm w-full justify-start gap-2 text-error" @click="logout">
        <Icon name="lucide:log-out" class="h-4 w-4" />
        Sign out
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close'])

const route = useRoute()
const { user } = useSanctumAuth()
const { logoutUser } = useAuthHelper()
const { can } = useCheckPermission()

const modules = ref([])
if (user.value) {
  modules.value = user.value.data.modules
}

const removedFinanceClients = new Set([
  'currencies',
  'exchangerates',
  'bankaccounttypes',
  'banks',
  'bankaccounts',
  'banktransactions',
])
const financeClientKey = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const visibleModules = computed(() => {
  const configuredModules = modules.value.map(module => ({
    ...module,
    submodules: (module.submodules ?? []).filter(submodule =>
      !removedFinanceClients.has(financeClientKey(submodule.url)) &&
      !removedFinanceClients.has(financeClientKey(submodule.name))
    ),
  })).filter(module => module.submodules.length > 0)

  const configuredUrls = new Set(
    configuredModules.flatMap(module => module.submodules.map(submodule => submodule.url)),
  )
  const systemConfigurationSubmodules = []

  if (can('can.access.systemsettings') && !configuredUrls.has('/system-settings')) {
    systemConfigurationSubmodules.push({
      id: 'procurement-plan-settings',
      name: 'Procurement Plan',
      icon: 'lucide:list-tree',
      url: '/system-settings',
    })
  }

  if (can('can.access.committes') && !configuredUrls.has('/committees')) {
    systemConfigurationSubmodules.push({
      id: 'committee-definitions',
      name: 'Committees',
      icon: 'lucide:users-round',
      url: '/committees',
    })
  }

  if (can('can.access.exemptiontypes') && !configuredUrls.has('/exemptiontypes')) {
    systemConfigurationSubmodules.push({
      id: 'exemption-type-definitions',
      name: 'Exemption Types',
      icon: 'lucide:tags',
      url: '/exemptiontypes',
    })
  }

  if (can('can.access.feedbacksessions') && !configuredUrls.has('/feedback-sessions')) {
    systemConfigurationSubmodules.push({
      id: 'feedback-sessions',
      name: 'Feedback Sessions',
      icon: 'lucide:messages-square',
      url: '/feedback-sessions',
    })
  }

  if (systemConfigurationSubmodules.length > 0) {
    configuredModules.push({
      id: 'system-configuration',
      name: 'System Configuration',
      icon: 'lucide:settings',
      submodules: systemConfigurationSubmodules,
    })
  }

  if (can('can.access.adminexemptions') && !configuredUrls.has('/admin-exemptions')) {
    configuredModules.push({
      id: 'admin-exemptions',
      name: 'Admin Exemptions',
      icon: 'lucide:columns-3',
      submodules: [{ id: 'admin-exemptions-board', name: 'Applications board', url: '/admin-exemptions', icon: 'lucide:layout-dashboard' }],
    })
  }

  const spocWorkflowSubmodules = []
  if (can('can.access.spocsubmissions') && !configuredUrls.has('/spoc-submissions')) {
    spocWorkflowSubmodules.push(
      { id: 'spoc-submissions-board', name: 'Submissions board', url: '/spoc-submissions', icon: 'lucide:columns-3' },
      { id: 'spoc-agendas', name: 'Agendas', url: '/spoc-agendas', icon: 'lucide:calendar-range' },
    )
  }
  if (can('can.access.myspoccases') && !configuredUrls.has('/my-spoc-cases')) {
    spocWorkflowSubmodules.push({ id: 'my-spoc-cases', name: 'My assigned cases', url: '/my-spoc-cases', icon: 'lucide:briefcase-business' })
  }
  if (spocWorkflowSubmodules.length > 0) {
    configuredModules.push({
      id: 'spoc-workflow',
      name: 'SPOC Workflow',
      icon: 'lucide:landmark',
      submodules: spocWorkflowSubmodules,
    })
  }

  if (can('can.review.adminexemptions') && !configuredUrls.has('/my-exemptions')) {
    configuredModules.push({
      id: 'my-exemptions-work',
      name: 'My Work',
      icon: 'lucide:inbox',
      submodules: [{ id: 'my-exemptions-queue', name: 'My exemptions', url: '/my-exemptions', icon: 'lucide:file-clock' }],
    })
  }

  const canManageSupplements = can('can.access.adminsupplements')
  if (canManageSupplements && !configuredUrls.has('/supplement-applications')) {
    configuredModules.push({
      id: 'supplement-applications',
      name: 'Supplement Applications',
      icon: 'lucide:files',
      submodules: [{ id: 'supplement-applications-board', name: 'Applications board', url: '/supplement-applications', icon: 'lucide:columns-3' }],
    })
  }

  return configuredModules
})

const imgUrl = ref('/img/nationalemblem.png')
const showLogoImage = ref(true)

const onLogoError = () => {
  showLogoImage.value = false
}

const logout = async () => {
  const { ok } = await logoutUser()
  if (ok) {
    await navigateTo('/login')
  }
}
</script>
