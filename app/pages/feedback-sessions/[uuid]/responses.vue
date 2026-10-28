<template>
  <div class="space-y-6">
    <header class="flex flex-col gap-4 border-b border-base-300 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><div class="breadcrumbs text-sm text-base-content/55"><ul><li><NuxtLink to="/feedback-sessions">Feedback sessions</NuxtLink></li><li>Responses</li></ul></div><h1 class="mt-2 text-2xl font-bold">{{ report.session?.title || 'Feedback responses' }}</h1><p class="mt-1 text-sm text-base-content/60">{{ report.session?.anonymous ? 'Anonymous response report' : 'Response report with participant details' }}</p></div><NuxtLink :to="`/feedback-sessions/${route.params.uuid}`" class="btn"><Icon name="lucide:eye" />View session</NuxtLink></header>
    <div v-if="loading" class="flex justify-center py-20"><span class="loading loading-spinner loading-lg" /></div>
    <div v-else-if="error" role="alert" class="alert alert-error"><Icon name="lucide:circle-alert" /><span>{{ error }}</span></div>
    <template v-else>
      <div class="stats stats-vertical w-full border border-base-300 bg-base-100 sm:stats-horizontal"><div class="stat"><div class="stat-title">Submitted responses</div><div class="stat-value text-primary">{{ report.submitted_count }}</div></div><div class="stat"><div class="stat-title">Questions</div><div class="stat-value">{{ report.questions.length }}</div></div><div class="stat"><div class="stat-title">Portal</div><div class="stat-value text-xl">{{ label(report.session.portal) }}</div></div></div>
      <div v-if="!report.submitted_count" class="card card-border bg-base-100"><div class="card-body items-center py-14 text-center"><Icon name="lucide:inbox" class="h-10 w-10 text-base-content/30" /><h2 class="card-title">No responses yet</h2><p class="text-base-content/55">Responses will appear here as participants submit the session.</p></div></div>
      <article v-for="(question, index) in report.questions" :key="question.uuid" class="card card-border bg-base-100"><div class="card-body"><div class="flex items-start gap-3"><span class="badge badge-ghost">{{ index + 1 }}</span><div class="flex-1"><h2 class="card-title text-base">{{ question.prompt }}</h2><p class="mt-1 text-xs text-base-content/50">{{ label(question.type) }} · {{ question.answer_count }} answers</p></div></div>
        <div v-if="Object.keys(question.distribution || {}).length" class="mt-4 space-y-2"><div v-for="(count, answer) in question.distribution" :key="answer" class="grid grid-cols-[minmax(7rem,14rem)_1fr_auto] items-center gap-3 text-sm"><span class="truncate">{{ answer }}</span><progress class="progress progress-success" :value="count" :max="Math.max(question.answer_count, 1)" /><strong>{{ count }}</strong></div></div>
        <div v-if="['SHORT_TEXT', 'LONG_TEXT'].includes(question.type)" class="mt-4 space-y-2"><div v-for="(answer, answerIndex) in question.answers" :key="answerIndex" class="rounded-box bg-base-200 p-4"><p class="whitespace-pre-line text-sm">{{ answer.value || 'No answer' }}</p><p v-if="answer.respondent" class="mt-2 text-xs text-base-content/45">{{ answer.respondent.name || 'Unnamed user' }}<span v-if="answer.respondent.organisation"> · {{ answer.respondent.organisation }}</span></p></div></div>
      </div></article>
    </template>
  </div>
</template>
<script setup>
definePageMeta({ middleware: ['sanctum:auth'] })
useHead({ title: 'Feedback responses' })
const route = useRoute(); const api = useFeedbackSessionHelper(); const loading = ref(true); const error = ref(''); const report = reactive({ session: null, submitted_count: 0, questions: [] })
const label = value => String(value || '').toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
onMounted(async () => { try { Object.assign(report, (await api.responses(route.params.uuid)).data) } catch (exception) { error.value = exception?.data?.message || 'Responses could not be loaded.' } finally { loading.value = false } })
</script>
