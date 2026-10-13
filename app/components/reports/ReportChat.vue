<template>
  <div class="flex h-[calc(100vh-12rem)] flex-col">
    <!-- Conversation -->
    <div ref="scrollEl" class="flex-1 space-y-4 overflow-y-auto px-1 py-2">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['chat', message.role === 'user' ? 'chat-end' : 'chat-start']"
      >
        <div class="chat-image avatar avatar-placeholder">
          <div class="w-8 rounded-full bg-base-300 text-base-content">
            <Icon :name="message.role === 'user' ? 'lucide:user' : 'lucide:sparkles'" class="h-4 w-4" />
          </div>
        </div>
        <div
          :class="[
            'chat-bubble max-w-[85%] whitespace-pre-wrap text-sm',
            message.role === 'user' ? 'chat-bubble-success' : '',
          ]"
        >
          {{ message.text }}
        </div>

        <!-- Inline report attached to an assistant message -->
        <div v-if="message.report" class="chat-footer mt-2 w-full max-w-3xl">
          <div class="rounded-xl border border-base-200 bg-base-100 p-3">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-xs font-medium uppercase tracking-wide text-base-content/50">
                Report preview
              </span>
              <button class="btn btn-ghost btn-xs gap-1" @click="openFull(message.report)">
                <Icon name="lucide:external-link" class="h-3 w-3" />
                Open full report
              </button>
            </div>
            <ReportsReportRender :payload="message.report" />
          </div>
        </div>
      </div>

      <div v-if="store.loading" class="chat chat-start">
        <div class="chat-image avatar avatar-placeholder">
          <div class="w-8 rounded-full bg-base-300 text-base-content">
            <Icon name="lucide:sparkles" class="h-4 w-4" />
          </div>
        </div>
        <div class="chat-bubble">
          <span class="loading loading-dots loading-sm" />
        </div>
      </div>
    </div>

    <!-- Suggestions -->
    <div v-if="suggestions.length && messages.length <= 1" class="flex flex-wrap gap-2 px-1 pb-2">
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="btn btn-outline btn-xs"
        @click="send(suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>

    <!-- Composer -->
    <form class="flex items-end gap-2 border-t border-base-200 pt-3" @submit.prevent="send()">
      <textarea
        v-model="draft"
        rows="1"
        placeholder="Ask for a report, e.g. “spend analysis for this year”"
        class="textarea textarea-bordered max-h-32 min-h-[2.75rem] flex-1 resize-none"
        :disabled="store.loading"
        @keydown.enter.exact.prevent="send()"
      />
      <button type="submit" class="btn btn-success" :disabled="store.loading || !draft.trim()">
        <Icon name="lucide:send" class="h-4 w-4" />
      </button>
    </form>
  </div>
</template>

<script setup>
const store = useReportStore()

const draft = ref('')
const messages = ref([])
const scrollEl = ref(null)
let nextId = 0

const suggestions = computed(() =>
  store.types.slice(0, 4).map((type) => `${type.label} for this year`),
)

const pushMessage = (role, text, report = null) => {
  messages.value.push({ id: nextId++, role, text, report })
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight
  })
}

const send = async (preset) => {
  const text = (preset ?? draft.value).trim()
  if (!text || store.loading) return

  pushMessage('user', text)
  draft.value = ''

  const { reply, report } = await store.chat(text)
  pushMessage('assistant', reply || 'Done.', report)
}

const openFull = async (report) => {
  store.payload = report
  await navigateTo('/reports/viewer')
}

onMounted(async () => {
  if (!store.types.length) await store.fetchTypes()
  pushMessage(
    'assistant',
    'Hi! Tell me what you would like to report on — for example “tender summary for the last quarter” or “spend analysis for the Ministry of Health this year”.',
  )
})
</script>
