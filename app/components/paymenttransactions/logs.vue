<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal">
      <Icon name="lucide:eye" />
      <span class="hidden md:block">View Logs</span>
    </button>
    <dialog :id="`pt_logs_modal_${item.id}`" class="modal">
      <div class="modal-box max-w-3xl">
        <div class="flex justify-between">
          <div>
            <h3 class="text-lg font-bold">Verification Logs</h3>
            <p class="text-sm text-base-content/60">
              Transaction #{{ item.id }} — {{ item.source_reference ?? '—' }}
            </p>
          </div>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('pt_logs_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <!-- Transaction summary card -->
        <div class="mt-4 mb-3 grid grid-cols-2 gap-2 rounded-lg bg-base-200 p-3 text-sm md:grid-cols-4">
          <div>
            <span class="block text-xs text-base-content/50">Amount</span>
            <span class="font-mono font-semibold">
              {{ item.currency_code }} {{ Number(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <div>
            <span class="block text-xs text-base-content/50">Payment Date</span>
            <span>{{ formatDate(item.payment_date) }}</span>
          </div>
          <div>
            <span class="block text-xs text-base-content/50">Attempts</span>
            <span class="font-semibold">{{ item.verification_attempts ?? 0 }}</span>
          </div>
          <div>
            <span class="block text-xs text-base-content/50">Verification</span>
            <span class="badge badge-sm" :class="item.flagged_for_manual ? 'badge-error' : 'badge-ghost'">
              {{ item.flagged_for_manual ? 'Flagged for Manual' : 'Automated' }}
            </span>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-6">
          <span class="loading loading-spinner loading-md" />
        </div>
        <div v-else-if="!logs.length" class="py-6 text-center text-sm text-base-content/50">
          No verification attempts logged yet.
        </div>
        <div v-else class="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          <div
            v-for="log in logs"
            :key="log.id"
            class="rounded-lg border text-sm"
            :class="log.result === 'MATCHED' ? 'border-success/40' : 'border-error/40'"
          >
            <!-- Log header -->
            <div
              class="flex items-start justify-between gap-2 rounded-t-lg px-3 py-2"
              :class="log.result === 'MATCHED' ? 'bg-success/10' : 'bg-error/10'"
            >
              <div class="flex items-center gap-2">
                <span class="badge badge-sm" :class="log.result === 'MATCHED' ? 'badge-success' : 'badge-error'">
                  {{ log.result }}
                </span>
                <span class="font-medium">Attempt #{{ log.attempt_number }}</span>
                <span v-if="log.company_name" class="text-base-content/60">· {{ log.company_name }}</span>
              </div>
              <div class="text-right text-xs text-base-content/50 shrink-0">
                <div v-if="log.best_confidence != null">
                  Confidence: <span class="font-semibold">{{ log.best_confidence }}%</span>
                </div>
                <div>{{ log.created_at ? new Date(log.created_at).toLocaleString('en-GB') : '' }}</div>
              </div>
            </div>

            <div class="space-y-2 px-3 py-2">
              <!-- Summary line -->
              <p v-if="log.details" class="text-base-content/80">{{ log.details }}</p>

              <!-- Parameters used by the CRM matcher -->
              <div v-if="log.match_details?.search_parameters" class="rounded bg-base-200 p-2">
                <p class="mb-1 text-xs font-semibold text-base-content/50 uppercase tracking-wide">Verification Parameters</p>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-3">
                  <div v-for="(value, field) in log.match_details.search_parameters" :key="field">
                    <span class="text-base-content/50">{{ parameterLabel(field) }}: </span>
                    <code class="rounded bg-base-100 px-1">{{ value ?? 'Not provided' }}</code>
                  </div>
                </div>
                <p v-if="log.match_details.candidates_returned !== undefined" class="mt-2 text-xs text-base-content/60">
                  CRM candidates returned: <span class="font-semibold">{{ log.match_details.candidates_returned }}</span>
                </p>
                <div v-if="log.match_details.search_attempts?.length" class="mt-2 space-y-1">
                  <p class="text-xs font-semibold text-base-content/50 uppercase tracking-wide">Sequential CRM Searches</p>
                  <div
                    v-for="attempt in log.match_details.search_attempts"
                    :key="`${attempt.parameter}-${attempt.value}`"
                    class="flex items-center justify-between rounded bg-base-100 px-2 py-1 text-xs"
                  >
                    <span>
                      {{ parameterLabel(attempt.parameter) }}:
                      <code>{{ attempt.value }}</code>
                    </span>
                    <span class="badge badge-xs">
                      {{ attempt.candidates_returned }} candidate{{ attempt.candidates_returned === 1 ? '' : 's' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Reasons CRM candidates were rejected -->
              <div v-if="log.match_details?.candidate_failures?.length" class="rounded border border-warning/30 bg-warning/5 p-2">
                <p class="mb-1 text-xs font-semibold text-warning uppercase tracking-wide">Candidate Rejection Reasons</p>
                <div
                  v-for="candidate in log.match_details.candidate_failures"
                  :key="candidate.crm_bank_transaction_id"
                  class="border-t border-base-300 py-1.5 first:border-t-0"
                >
                  <p class="text-xs font-medium">
                    CRM transaction #{{ candidate.crm_bank_transaction_id ?? 'Unknown' }}
                    <span v-if="candidate.status" class="badge badge-xs ml-1">{{ candidate.status }}</span>
                  </p>
                  <p class="text-xs text-base-content/50">
                    References: {{ candidate.references?.join(', ') || 'None' }} ·
                    Amount: {{ candidate.amount ?? 'Unknown' }} ·
                    Currency: {{ candidate.currency ?? 'Unknown' }}
                  </p>
                  <ul class="mt-1 list-disc pl-4 text-xs text-base-content/70">
                    <li v-for="reason in candidate.reasons" :key="reason">{{ reason }}</li>
                  </ul>
                </div>
              </div>

              <!-- Best match details -->
              <div v-if="log.match_details?.best_match" class="rounded bg-base-200 p-2">
                <p class="mb-1 text-xs font-semibold text-base-content/50 uppercase tracking-wide">Closest Match</p>
                <div class="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs md:grid-cols-4">
                  <div><span class="text-base-content/50">ID: </span>{{ log.match_details.best_match.bank_transaction_id }}</div>
                  <div><span class="text-base-content/50">Ref: </span><code class="rounded bg-base-100 px-1">{{ log.match_details.best_match.reference ?? '—' }}</code></div>
                  <div><span class="text-base-content/50">Amount: </span>{{ log.match_details.best_match.amount ?? '—' }}</div>
                  <div><span class="text-base-content/50">Bank: </span>{{ log.match_details.best_match.bank ?? '—' }}</div>
                </div>
              </div>

              <!-- Score breakdown -->
              <div v-if="log.match_details?.score_breakdown" class="rounded bg-base-200 p-2">
                <p class="mb-1 text-xs font-semibold text-base-content/50 uppercase tracking-wide">Confidence Breakdown</p>
                <div class="grid grid-cols-3 gap-1 text-xs md:grid-cols-6">
                  <div v-for="(score, field) in log.match_details.score_breakdown" :key="field" class="text-center">
                    <div class="text-base-content/50 truncate">{{ fieldLabel(field) }}</div>
                    <div
                      class="font-mono font-semibold"
                      :class="score > 0 ? 'text-success' : 'text-base-content/30'"
                    >
                      {{ score }}
                    </div>
                    <div class="text-base-content/30 text-[10px]">/ {{ fieldMax(field) }}</div>
                  </div>
                </div>
              </div>

              <!-- Failure reason -->
              <div v-if="log.match_details?.failure_reason" class="rounded border border-warning/30 bg-warning/5 p-2 text-xs text-base-content/70">
                <span class="font-semibold text-warning">Why it failed: </span>{{ log.match_details.failure_reason }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-action">
          <button class="btn" :onclick="`document.getElementById('pt_logs_modal_${item.id}').close()`">
            Close
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  logsUrl: { type: String, default: '' },
})

const store = usePaymentTransactionStore()
const client = useSanctumClient()
const toast = useToast()
const logs = ref([])
const loading = ref(false)

const fieldLabels = {
  sourcereference: 'Source Ref',
  description: 'Description',
  statementreference: 'Stmt Ref',
  amount: 'Amount',
  referencenumber: 'Ref No.',
  transactiondate: 'Date',
}

const fieldMaxes = {
  sourcereference: 40,
  description: 25,
  statementreference: 20,
  amount: 10,
  referencenumber: 3,
  transactiondate: 2,
}

const parameterLabels = {
  source_reference: 'Source reference',
  bank_reference: 'Bank reference',
  stan_code: 'STAN code',
  correspondent_reference: 'Correspondent reference',
  invoice_payment_reference: 'Invoice payment reference',
  expected_amount: 'Expected amount',
  expected_currency: 'Expected currency',
}

const parameterLabel = field => parameterLabels[field] ?? field.replace(/_/g, ' ')

const fieldLabel = (field) => fieldLabels[field] ?? field
const fieldMax = (field) => fieldMaxes[field] ?? '?'

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const openModal = async () => {
  document.getElementById(`pt_logs_modal_${props.item.id}`).showModal()
  loading.value = true
  if (props.logsUrl) {
    try {
      const response = await client(props.logsUrl, { method: 'GET' })
      logs.value = response?.data ?? []
    } catch (error) {
      const message = error?.data?.message || error?.message || 'Failed to fetch verification logs.'
      toast.error({ title: 'Error', message, position: 'topRight', layout: 2 })
      logs.value = []
    }
  } else {
    logs.value = await store.fetchLogs(props.item.id)
  }
  loading.value = false
}
</script>
