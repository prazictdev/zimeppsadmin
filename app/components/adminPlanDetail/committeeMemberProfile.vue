<template>
  <dialog ref="profileDialog" class="modal" aria-labelledby="committee-member-profile-title" @close="$emit('close')">
    <div class="modal-box max-h-[92vh] max-w-4xl overflow-y-auto p-0">
      <header class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-200 bg-base-100 px-6 py-5">
        <div class="flex min-w-0 items-center gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="lucide:user-round" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-base-content/45">{{ committeeLabel }}</p>
            <h3 id="committee-member-profile-title" class="truncate text-xl font-bold">{{ memberName }}</h3>
          </div>
        </div>
        <button type="button" class="btn btn-circle btn-ghost btn-sm" aria-label="Close member profile" @click="close">
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </header>

      <div class="space-y-5 p-6">
        <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Member details">
          <div v-for="detail in memberDetails" :key="detail.label" class="rounded-xl border border-base-200 bg-base-100 p-4">
            <p class="text-xs font-medium text-base-content/45">{{ detail.label }}</p>
            <p class="mt-1 break-words font-semibold">{{ detail.value }}</p>
          </div>
        </section>

        <section class="overflow-hidden rounded-xl border border-base-200">
          <header class="flex items-center justify-between border-b border-base-200 bg-base-200/35 px-4 py-3">
            <div class="flex items-center gap-2 font-semibold"><Icon name="lucide:badge-check" class="h-4 w-4 text-primary" /> User account</div>
            <span :class="['badge badge-sm', accountActive ? 'badge-success' : 'badge-warning']">{{ accountStatus }}</span>
          </header>
          <dl class="grid divide-y divide-base-200 text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <div class="p-4"><dt class="text-base-content/45">Login email</dt><dd class="mt-1 font-medium">{{ email }}</dd></div>
            <div class="p-4"><dt class="text-base-content/45">Email verification</dt><dd class="mt-1 font-medium">{{ member.user?.email_verified_at ? 'Verified' : 'Not verified' }}</dd></div>
          </dl>
        </section>

        <section v-if="supportsProfessionalProfile" class="overflow-hidden rounded-xl border border-base-200">
          <header class="flex items-center justify-between border-b border-base-200 bg-base-200/35 px-4 py-3">
            <div class="flex items-center gap-2 font-semibold"><Icon name="lucide:graduation-cap" class="h-4 w-4 text-primary" /> Qualifications</div>
            <span class="badge badge-sm badge-ghost">{{ qualifications.length }}</span>
          </header>
          <p v-if="!qualifications.length" class="p-6 text-center text-sm text-base-content/50">No qualifications recorded.</p>
          <div v-else class="overflow-x-auto">
            <table class="table table-sm">
              <thead><tr><th>Qualification</th><th>Institution</th><th>Year obtained</th></tr></thead>
              <tbody>
                <tr v-for="qualification in qualifications" :key="qualification.id || `${qualification.qualification}-${qualification.institution}`">
                  <td class="font-medium">{{ qualification.qualification || '—' }}</td>
                  <td>{{ qualification.institution || '—' }}</td>
                  <td>{{ qualification.yearobtained || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="supportsProfessionalProfile" class="overflow-hidden rounded-xl border border-base-200">
          <header class="flex items-center justify-between border-b border-base-200 bg-base-200/35 px-4 py-3">
            <div class="flex items-center gap-2 font-semibold"><Icon name="lucide:briefcase-business" class="h-4 w-4 text-primary" /> Work history</div>
            <span class="badge badge-sm badge-ghost">{{ workHistory.length }}</span>
          </header>
          <p v-if="!workHistory.length" class="p-6 text-center text-sm text-base-content/50">No work history recorded.</p>
          <div v-else class="overflow-x-auto">
            <table class="table table-sm">
              <thead><tr><th>Employer</th><th>Position</th><th>Period</th></tr></thead>
              <tbody>
                <tr v-for="entry in workHistory" :key="entry.id || `${entry.employer}-${entry.position}`">
                  <td class="font-medium">{{ entry.employer || '—' }}</td>
                  <td>{{ entry.position || '—' }}</td>
                  <td class="whitespace-nowrap">{{ period(entry) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer class="sticky bottom-0 flex justify-end border-t border-base-200 bg-base-100 px-6 py-4">
        <button type="button" class="btn btn-primary" @click="close">Close profile</button>
      </footer>
    </div>
    <form method="dialog" class="modal-backdrop"><button>close</button></form>
  </dialog>
</template>

<script setup>
const props = defineProps({
  member: { type: Object, required: true },
  committeeLabel: { type: String, required: true },
  supportsProfessionalProfile: { type: Boolean, default: false },
})
defineEmits(['close'])

const profileDialog = ref(null)
const qualifications = computed(() => props.member.qualifications ?? [])
const workHistory = computed(() => props.member.workhistory ?? [])
const email = computed(() => props.member.email || props.member.user?.email || '—')
const memberName = computed(() => {
  const parts = [props.member.firstname || props.member.name || props.member.user?.name, props.member.lastname || props.member.user?.lastname].filter(Boolean)
  return parts.join(' ') || props.member.fullname || 'Committee member'
})
const accountStatus = computed(() => props.member.user?.status?.replaceAll('_', ' ') || 'No linked login account')
const accountActive = computed(() => ['ACTIVE', 'ACTIVATED'].includes(props.member.user?.status))
const memberDetails = computed(() => [
  { label: 'Committee role', value: props.member.role?.name || '—' },
  { label: 'Designation', value: props.member.designation || '—' },
  { label: 'Gender', value: props.member.gender || '—' },
  { label: 'Phone', value: props.member.phone || '—' },
])

const formatDate = value => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}
const period = entry => `${formatDate(entry.startdate) || 'Not specified'} – ${formatDate(entry.enddate) || 'Present'}`
const close = () => profileDialog.value?.close()

onMounted(() => profileDialog.value?.showModal())
</script>
