<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div><div class="breadcrumbs text-sm text-base-content/55"><ul><li><NuxtLink to="/feedback-sessions">Feedback sessions</NuxtLink></li><li>{{ isNew ? 'Create' : 'Session' }}</li></ul></div><h1 class="mt-2 text-2xl font-bold">{{ isNew ? 'Create a testing session' : form.title || 'Feedback session' }}</h1><p class="mt-1 text-sm text-base-content/60">Set the audience first, then turn the testing brief into scenarios and questions.</p></div>
      <div class="flex gap-2"><NuxtLink to="/feedback-sessions" class="btn">Cancel</NuxtLink><button v-if="editable" class="btn btn-primary" :disabled="saving" @click="save"><span v-if="saving" class="loading loading-spinner loading-sm" />Save session</button></div>
    </header>

    <div v-if="loading" class="flex justify-center py-20"><span class="loading loading-spinner loading-lg" /></div>
    <div v-else class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div class="space-y-6">
        <div v-if="error" role="alert" class="alert alert-error"><Icon name="lucide:circle-alert" /><span>{{ error }}</span></div>
        <section class="card card-border bg-base-100"><div class="card-body">
          <h2 class="card-title">Session brief</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <fieldset class="fieldset md:col-span-2"><legend class="fieldset-legend">Title</legend><input v-model.trim="form.title" class="input w-full" :disabled="!editable" placeholder="Supplier portal pilot — October 2026" /></fieldset>
            <fieldset class="fieldset md:col-span-2"><legend class="fieldset-legend">Instructions for testers</legend><textarea v-model.trim="form.description" class="textarea min-h-28 w-full" :disabled="!editable" placeholder="Explain the purpose of this test and what participants should complete." /></fieldset>
            <fieldset class="fieldset"><legend class="fieldset-legend">Portal</legend><select v-model="form.portal" class="select w-full" :disabled="!editable"><option v-for="portal in options.portals" :key="portal" :value="portal">{{ label(portal) }}</option></select></fieldset>
            <fieldset class="fieldset"><legend class="fieldset-legend">Response identity</legend><label class="label cursor-pointer justify-start gap-3"><input v-model="form.anonymous" type="checkbox" class="checkbox" :disabled="!editable" /><span>Hide respondent identities in reports</span></label></fieldset>
            <fieldset class="fieldset"><legend class="fieldset-legend">Opens</legend><input v-model="form.opens_at" type="datetime-local" class="input w-full" :disabled="!editable" /><p class="label">Leave blank to open when published.</p></fieldset>
            <fieldset class="fieldset"><legend class="fieldset-legend">Closes</legend><input v-model="form.closes_at" type="datetime-local" class="input w-full" :disabled="!editable" /><p class="label">Leave blank for no deadline.</p></fieldset>
          </div>
        </div></section>

        <section class="card card-border bg-base-100"><div class="card-body">
          <h2 class="card-title">Target groups</h2><p class="text-sm text-base-content/55">If no groups are selected, every signed-in user on the selected portal can participate. Selecting account types and roles creates one combined audience.</p>
          <div class="mt-2 grid gap-5 md:grid-cols-2">
            <fieldset class="fieldset"><legend class="fieldset-legend">Account types</legend><div class="max-h-56 space-y-2 overflow-y-auto rounded-box border border-base-300 p-3"><label v-for="item in options.accounttypes" :key="item.id" class="label cursor-pointer justify-start gap-3"><input v-model="form.target_accounttype_ids" :value="item.id" type="checkbox" class="checkbox checkbox-sm" :disabled="!editable" /><span>{{ item.name }}</span></label></div></fieldset>
            <fieldset class="fieldset"><legend class="fieldset-legend">Roles</legend><div class="max-h-56 space-y-2 overflow-y-auto rounded-box border border-base-300 p-3"><label v-for="item in options.roles" :key="item.id" class="label cursor-pointer justify-start gap-3"><input v-model="form.target_role_ids" :value="item.id" type="checkbox" class="checkbox checkbox-sm" :disabled="!editable" /><span>{{ item.name }}</span></label></div></fieldset>
          </div>
        </div></section>

        <section class="space-y-4">
          <div><h2 class="text-lg font-bold">Overall experience questions</h2><p class="text-sm text-base-content/55">Ask questions that apply to the full test, such as overall usability, visual clarity, performance and confidence.</p></div>
          <FeedbackQuestionBuilder v-if="editable" v-model="form.questions" />
          <div v-else><QuestionPreview :questions="form.questions" /></div>
        </section>

        <section class="space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 class="text-lg font-bold">Test scenarios</h2><p class="text-sm text-base-content/55">Give participants a real task, state the intended outcome, then ask about that experience.</p></div><button v-if="editable" type="button" class="btn btn-outline btn-sm" @click="addScenario"><Icon name="lucide:plus" />Add scenario</button></div>
          <div v-if="!form.scenarios.length" class="card card-dash"><div class="card-body items-center py-10 text-center"><Icon name="lucide:list-checks" class="h-9 w-9 text-base-content/30" /><p class="font-semibold">No scenarios added</p><p class="text-sm text-base-content/50">Scenarios turn general feedback into evidence about a specific workflow.</p></div></div>
          <article v-for="(scenario, index) in form.scenarios" :key="scenario.localId" class="card card-border bg-base-200/45"><div class="card-body">
            <div class="flex items-start gap-3"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-box bg-neutral font-bold text-neutral-content">{{ index + 1 }}</span><div class="grid flex-1 gap-3 md:grid-cols-2"><fieldset class="fieldset md:col-span-2"><legend class="fieldset-legend">Scenario title</legend><input v-model="scenario.title" class="input w-full" :disabled="!editable" placeholder="Find and review a suitable tender" /></fieldset><fieldset class="fieldset"><legend class="fieldset-legend">Task instructions</legend><textarea v-model="scenario.instructions" class="textarea min-h-24 w-full" :disabled="!editable" placeholder="Ask the tester to complete a clear task." /></fieldset><fieldset class="fieldset"><legend class="fieldset-legend">Expected outcome</legend><textarea v-model="scenario.expected_outcome" class="textarea min-h-24 w-full" :disabled="!editable" placeholder="Describe what successful completion looks like." /></fieldset></div><button v-if="editable" type="button" class="btn btn-ghost btn-sm text-error" @click="form.scenarios.splice(index, 1)"><Icon name="lucide:trash-2" /></button></div>
            <div class="divider text-xs text-base-content/45">Questions for this scenario</div>
            <FeedbackQuestionBuilder v-if="editable" v-model="scenario.questions" />
            <QuestionPreview v-else :questions="scenario.questions" />
          </div></article>
        </section>
      </div>

      <aside class="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <div class="card card-border bg-base-100"><div class="card-body"><h2 class="card-title text-base">Ready to publish?</h2><ul class="space-y-3 text-sm"><li class="flex gap-2"><Icon :name="form.title ? 'lucide:circle-check' : 'lucide:circle'" :class="form.title ? 'text-success' : 'text-base-content/30'" />Clear session title</li><li class="flex gap-2"><Icon :name="questionCount ? 'lucide:circle-check' : 'lucide:circle'" :class="questionCount ? 'text-success' : 'text-base-content/30'" />At least one question</li><li class="flex gap-2"><Icon :name="form.scenarios.length ? 'lucide:circle-check' : 'lucide:circle'" :class="form.scenarios.length ? 'text-success' : 'text-base-content/30'" />Task scenarios <span class="text-base-content/45">optional</span></li></ul><div class="divider" /><p class="text-xs leading-5 text-base-content/55">Save the session as a draft, review it, then publish it from the sessions list.</p></div></div>
        <div class="alert alert-info alert-soft"><Icon name="lucide:info" /><span class="text-sm">Published sessions are locked to protect response consistency. Create a new session for a revised test round.</span></div>
      </aside>
    </div>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default', sanctum: { authOnly: true } })
const route = useRoute(); const router = useRouter(); const api = useFeedbackSessionHelper()
const isNew = computed(() => route.params.uuid === 'new')
const loading = ref(true); const saving = ref(false); const error = ref('')
const options = reactive({ portals: ['SUPPLIER', 'PROCUREMENT_ENTITY', 'ADMIN', 'MOBILE'], accounttypes: [], roles: [] })
const form = reactive({ title: '', description: '', portal: 'SUPPLIER', target_accounttype_ids: [], target_role_ids: [], anonymous: false, opens_at: '', closes_at: '', status: 'DRAFT', questions: [], scenarios: [] })
const editable = computed(() => isNew.value || form.status === 'DRAFT')
const questionCount = computed(() => form.questions.length + form.scenarios.reduce((total, scenario) => total + scenario.questions.length, 0))
const label = value => String(value || '').toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
const localDate = value => value ? new Date(value).toISOString().slice(0, 16) : ''
const hydrateQuestion = question => ({ ...question, localId: crypto.randomUUID(), optionsText: (question.options || []).join(', ') })

async function load() {
  loading.value = true
  try {
    const optionResponse = await api.options(); Object.assign(options, optionResponse.data)
    if (!isNew.value) {
      const response = await api.get(route.params.uuid); const data = response.data
      Object.assign(form, data, { opens_at: localDate(data.opens_at), closes_at: localDate(data.closes_at), questions: (data.questions || []).map(hydrateQuestion), scenarios: (data.scenarios || []).map(item => ({ ...item, localId: crypto.randomUUID(), questions: (item.questions || []).map(hydrateQuestion) })) })
    }
  } catch (exception) { error.value = exception?.data?.message || 'The feedback session could not be loaded.' }
  finally { loading.value = false }
}
function addScenario() { form.scenarios.push({ localId: crypto.randomUUID(), title: '', instructions: '', expected_outcome: '', questions: [] }) }
function cleanQuestion(question) { return { prompt: question.prompt, help_text: question.help_text || null, type: question.type, options: ['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(question.type) ? question.optionsText.split(',').map(item => item.trim()).filter(Boolean) : null, required: Boolean(question.required), rating_min: question.type === 'RATING' ? Number(question.rating_min || 1) : null, rating_max: question.type === 'RATING' ? Number(question.rating_max || 5) : null, low_label: question.low_label || null, high_label: question.high_label || null } }
async function save() {
  error.value = ''
  if (!form.title || !questionCount.value) { error.value = 'Add a session title and at least one question.'; return }
  saving.value = true
  const payload = { title: form.title, description: form.description || null, portal: form.portal, target_accounttype_ids: form.target_accounttype_ids, target_role_ids: form.target_role_ids, anonymous: form.anonymous, opens_at: form.opens_at || null, closes_at: form.closes_at || null, questions: form.questions.map(cleanQuestion), scenarios: form.scenarios.map((scenario, index) => ({ title: scenario.title, instructions: scenario.instructions || null, expected_outcome: scenario.expected_outcome || null, sort_order: index, questions: scenario.questions.map(cleanQuestion) })) }
  try { const response = isNew.value ? await api.create(payload) : await api.update(route.params.uuid, payload); await router.push(`/feedback-sessions/${response.data.uuid}`) }
  catch (exception) { error.value = exception?.data?.message || Object.values(exception?.data?.data || {}).flat().join(' ') || 'The session could not be saved.' }
  finally { saving.value = false }
}
onMounted(load)
</script>
