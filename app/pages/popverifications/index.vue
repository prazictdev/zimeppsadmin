<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul>
            <li><NuxtLink to="/">Home</NuxtLink></li>
            <li>POP Verifications</li>
          </ul>
        </div>
      </div>
    </div>

    <div v-if="!canAccess" role="alert" class="alert alert-error mt-3">
      <Icon name="lucide:alert-circle" />
      <span>You do not have permission to access this page.</span>
    </div>

    <div v-else class="card mt-3 border border-base-200">
      <div class="card-body">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-2">
          <div>
            <p class="text-lg font-bold">POP Verification Queue</p>
            <p class="text-xs text-base-content/60">
              Tracks each submitted POP through verification. The 48-hour manual-verification deadline pauses on weekends.
            </p>
          </div>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Search invoice no., reference, company..."
            class="input input-bordered input-sm w-72"
            @input="onSearch"
          />
        </div>

        <div role="tablist" class="tabs tabs-bordered mt-3">
          <button
            role="tab"
            class="tab"
            :class="{ 'tab-active': type === 'REGISTRATION' }"
            @click="setType('REGISTRATION')"
          >
            <Icon name="lucide:user-check" class="mr-1" />
            Registration Invoices
          </button>
          <button
            role="tab"
            class="tab"
            :class="{ 'tab-active': type === 'PLAN_AUTHORIZATION' }"
            @click="setType('PLAN_AUTHORIZATION')"
          >
            <Icon name="lucide:file-check" class="mr-1" />
            Plan Authorization Invoices
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <div v-else class="mt-4">
          <div v-if="!items.length" class="rounded-box border border-dashed border-base-300 py-14 text-center text-base-content/50">
            <Icon name="lucide:inbox" class="mx-auto mb-2 h-8 w-8" />
            <p>No {{ type === 'PLAN_AUTHORIZATION' ? 'plan authorization' : 'registration' }} invoices are awaiting verification.</p>
          </div>

          <div v-else class="overflow-x-auto pb-2">
            <div class="grid min-w-[980px] grid-cols-3 gap-4">
              <section
                v-for="column in kanbanColumns"
                :key="column.key"
                class="rounded-box border border-base-200 bg-base-200/35"
              >
              <header class="flex items-start justify-between gap-3 border-b border-base-200 bg-base-100/80 p-3">
                <div class="flex gap-2">
                  <span :class="['mt-0.5 rounded-lg p-2', column.iconClass]">
                    <Icon :name="column.icon" class="h-4 w-4" />
                  </span>
                  <div>
                    <h2 class="text-sm font-semibold">{{ column.title }}</h2>
                    <p class="mt-0.5 text-xs text-base-content/55">{{ column.description }}</p>
                  </div>
                </div>
                <span :class="['badge badge-sm font-semibold', column.badgeClass]">{{ column.items.length }}</span>
              </header>

              <div class="space-y-3 p-3">
                <div v-if="!column.items.length" class="rounded-lg border border-dashed border-base-300 bg-base-100/60 px-3 py-8 text-center text-xs text-base-content/45">
                  No transactions in this stage
                </div>

                <article
                  v-for="inv in column.items"
                  :key="inv.id"
                  class="rounded-lg border border-base-200 bg-base-100 p-3 shadow-sm"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold">{{ inv.company?.name || 'Unknown company' }}</p>
                      <p class="mt-0.5 font-mono text-xs text-base-content/55">{{ inv.invoice_number }}</p>
                    </div>
                    <span :class="['badge badge-xs shrink-0', matchStatusBadge(inv.latest_transaction?.status)]">
                      {{ matchStatusLabel(inv.latest_transaction?.status) }}
                    </span>
                  </div>

                  <div class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <p class="text-base-content/45">Amount</p>
                      <p class="font-mono font-semibold">{{ inv.currency?.code }} {{ formatAmount(inv.total) }}</p>
                    </div>
                    <div>
                      <p class="text-base-content/45">Submitted</p>
                      <p>{{ formatDate(inv.latest_transaction?.created_at) }}</p>
                    </div>
                    <div>
                      <p class="text-base-content/45">Payment reference</p>
                      <p class="truncate font-mono">{{ inv.paymentreference || '—' }}</p>
                    </div>
                    <div>
                      <p class="text-base-content/45">Source bank</p>
                      <p class="truncate">{{ inv.latest_transaction?.source_bank || '—' }}</p>
                    </div>
                    <div v-if="type === 'PLAN_AUTHORIZATION'">
                      <p class="text-base-content/45">Plan year</p>
                      <p>{{ inv.annualprocurementplan?.year || '—' }}</p>
                    </div>
                    <div>
                      <p class="text-base-content/45">Attempts</p>
                      <p>{{ inv.latest_transaction?.verification_attempts || 0 }}</p>
                    </div>
                  </div>

                  <div :class="['mt-3 rounded-md px-2.5 py-2 text-xs', deadlineTone(inv)]">
                    <div class="flex items-center gap-1.5 font-medium">
                      <Icon :name="queueStage(inv) === 'manual' ? 'lucide:triangle-alert' : 'lucide:clock-3'" />
                      {{ deadlineLabel(inv) }}
                    </div>
                    <p class="mt-0.5 opacity-70">48 weekday-hours from submission; weekends excluded.</p>
                  </div>

                  <div class="mt-3 flex flex-wrap gap-1 border-t border-base-200 pt-3">
                    <PaymenttransactionsLogs
                      v-if="inv.latest_transaction?.id"
                      :item="{
                        ...inv.latest_transaction,
                        currency_code: inv.latest_transaction?.currency?.code || inv.currency?.code,
                      }"
                      :logs-url="`/api/v1/pop-verifications/${inv.id}/attempt-logs`"
                    />
                    <button
                      v-if="inv.latest_transaction?.id"
                      class="btn btn-ghost btn-xs"
                      title="View proof of payment"
                      @click="openPop(inv.id)"
                    >
                      <Icon name="lucide:file-text" /> POP
                    </button>
                    <button class="btn btn-success btn-xs" @click="openVerify(inv)">
                      <Icon name="lucide:check" /> Verify
                    </button>
                    <button class="btn btn-error btn-outline btn-xs" @click="openCancel(inv)">
                      <Icon name="lucide:x" /> Cancel
                    </button>
                  </div>
                </article>
              </div>
              </section>
            </div>
          </div>

          <div v-if="meta.last_page > 1" class="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs text-base-content/60">
              Page {{ meta.current_page }} of {{ meta.last_page }} · {{ meta.total }} total
            </div>
            <div class="join">
              <button class="btn btn-sm join-item" :disabled="meta.current_page <= 1 || loading" @click="goTo(meta.current_page - 1)">Prev</button>
              <button class="btn btn-sm join-item btn-disabled">{{ meta.current_page }}</button>
              <button class="btn btn-sm join-item" :disabled="meta.current_page >= meta.last_page || loading" @click="goTo(meta.current_page + 1)">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Verify modal — search + claim + settle -->
    <dialog id="pop_verify_modal" class="modal">
      <div class="modal-box max-w-4xl">
        <div class="flex items-center justify-between border-b border-base-200 pb-2">
          <h3 class="text-lg font-bold">Verify invoice via bank transaction</h3>
          <button class="btn btn-ghost btn-circle" @click="closeVerify">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div
          v-if="activeInvoice?.latest_transaction?.status === 'MATCH_FAILED'"
          role="alert"
          class="alert alert-error mt-3"
        >
          <Icon name="lucide:search-x" />
          <div>
            <p class="font-semibold">Automatic CRM matching failed</p>
            <p class="text-xs">
              No matching transaction was found within 24 hours. Review the captured reference and use the search below.
            </p>
          </div>
        </div>

        <!-- Invoice summary -->
        <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="rounded border border-base-200 p-3">
            <p class="font-semibold mb-2">Invoice</p>
            <table class="table table-xs">
              <tbody>
                <tr><td class="text-base-content/60">Number</td><td class="font-mono">{{ activeInvoice?.invoice_number }}</td></tr>
                <tr><td class="text-base-content/60">Company</td><td>{{ activeInvoice?.company?.name || '—' }}</td></tr>
                <tr><td class="text-base-content/60">Total</td><td class="font-mono">{{ activeInvoice?.currency?.code }} {{ formatAmount(activeInvoice?.total) }}</td></tr>
                <tr><td class="text-base-content/60">Outstanding</td><td class="font-mono font-semibold">{{ activeInvoice?.currency?.code }} {{ formatAmount(activeInvoice?.remaining_balance) }}</td></tr>
                <tr><td class="text-base-content/60">Bank account</td><td>{{ activeInvoice?.inventoryitem?.bankaccounttype?.name || '—' }}</td></tr>
                <tr><td class="text-base-content/60">Payment ref</td><td class="font-mono">{{ activeInvoice?.paymentreference || '—' }}</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Submitted POP -->
          <div class="rounded border border-base-200 p-3">
            <p class="font-semibold mb-2">Submitted proof of payment</p>
            <table class="table table-xs">
              <tbody>
                <tr><td class="text-base-content/60">Source bank</td><td>{{ pop?.source_bank || '—' }}</td></tr>
                <tr><td class="text-base-content/60">Account name</td><td>{{ pop?.account_name || '—' }}</td></tr>
                <tr><td class="text-base-content/60">Account number</td><td class="font-mono">{{ pop?.account_number || '—' }}</td></tr>
                <tr><td class="text-base-content/60">Source reference</td><td class="font-mono">{{ pop?.source_reference || '—' }}</td></tr>
                <tr><td class="text-base-content/60">STAN code</td><td class="font-mono">{{ pop?.stan_code || '—' }}</td></tr>
                <tr><td class="text-base-content/60">Amount</td><td class="font-mono">{{ pop?.currency?.code || activeInvoice?.currency?.code }} {{ formatAmount(pop?.amount) }}</td></tr>
                <tr><td class="text-base-content/60">Payment date</td><td>{{ formatDate(pop?.payment_date) }}</td></tr>
                <tr><td class="text-base-content/60">Submitted at</td><td>{{ formatDate(pop?.created_at) }}</td></tr>
                <tr v-if="pop?.notes"><td class="text-base-content/60">Notes</td><td class="text-xs italic">"{{ pop.notes }}"</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Wallet balances -->
        <div class="mt-3 rounded border border-base-200 p-3">
          <p class="font-semibold mb-2 flex items-center gap-1">
            <Icon name="lucide:wallet" class="h-4 w-4" />
            Company wallet (unutilised claimed funds)
          </p>
          <div v-if="!wallet.length" class="text-sm text-base-content/50">
            No claimed funds in the wallet. Claiming a bank transaction below adds funds here, which the settlement then consumes.
          </div>
          <table v-else class="table table-xs">
            <thead>
              <tr>
                <th>Bank account</th>
                <th>Currency</th>
                <th class="text-right">Deposited</th>
                <th class="text-right">Used</th>
                <th class="text-right">Available</th>
                <th class="text-right">Rows</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(w, i) in wallet" :key="i">
                <td>{{ w.bankaccount_type || '—' }}</td>
                <td>{{ w.currency_code }}</td>
                <td class="text-right font-mono">{{ formatAmount(w.deposited) }}</td>
                <td class="text-right font-mono text-base-content/60">{{ formatAmount(w.used) }}</td>
                <td class="text-right font-mono font-semibold">{{ formatAmount(w.available) }}</td>
                <td class="text-right">{{ w.suspense_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Manual search -->
        <div class="mt-3 rounded border border-base-200 p-3">
          <p class="font-semibold mb-2 flex items-center gap-1">
            <Icon name="lucide:search" class="h-4 w-4" />
            Manual search
          </p>
          <p class="text-xs text-base-content/60 mb-2">
            Searches PENDING bank transactions by description, source reference, statement reference, or reference number.
          </p>
          <form class="flex gap-2" @submit.prevent="runManualSearch">
            <input
              v-model="manualQuery"
              type="text"
              class="input input-bordered input-sm flex-1"
              placeholder="e.g. EGP-INV-... or transaction narration"
              minlength="3"
            />
            <button type="submit" class="btn btn-sm btn-primary" :disabled="searching || manualQuery.trim().length < 3">
              <Icon name="lucide:search" class="h-4 w-4" /> Search
            </button>
            <button
              v-if="searchMode === 'manual'"
              type="button"
              class="btn btn-sm btn-ghost"
              @click="runSearch"
              title="Switch back to AI auto-match"
            >
              <Icon name="lucide:rotate-ccw" class="h-4 w-4" /> Auto-match
            </button>
          </form>
        </div>

        <!-- Candidates -->
        <div class="mt-3">
          <div class="flex items-center justify-between mb-2">
            <p class="text-sm font-semibold">
              <template v-if="searchMode === 'manual'">Manual search results</template>
              <template v-else>Matching bank transactions (auto)</template>
            </p>
            <button v-if="searchMode === 'auto'" class="btn btn-ghost btn-xs" :disabled="searching" @click="runSearch">
              <Icon name="lucide:refresh-cw" /> Re-run auto-match
            </button>
          </div>

          <div v-if="searching" class="flex justify-center py-6">
            <span class="loading loading-spinner loading-md" />
          </div>
          <div v-else-if="!candidates.length" class="text-center py-6 text-sm text-base-content/60">
            <Icon name="lucide:search-x" class="h-5 w-5 mx-auto mb-1" />
            No matching bank transactions found. Use the fallback below if you've confirmed the POP out-of-band.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th></th>
                  <th>Ref / STAN</th>
                  <th>Source reference</th>
                  <th>Description</th>
                  <th class="text-right">Amount</th>
                  <th>Date</th>
                  <th class="text-right">Confidence</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="c in candidates"
                  :key="c.bank_transaction_id"
                  :class="{ 'bg-success/10': selectedBtId === c.bank_transaction_id }"
                >
                  <td>
                    <input
                      type="radio"
                      name="bt_pick"
                      class="radio radio-sm"
                      :value="c.bank_transaction_id"
                      v-model="selectedBtId"
                    />
                  </td>
                  <td class="font-mono text-xs">
                    {{ c.referencenumber || '—' }}
                    <Icon v-if="c.stan_exact_match" name="lucide:check-circle" class="h-3 w-3 inline text-success" title="STAN exact match" />
                  </td>
                  <td class="font-mono text-xs">
                    {{ c.sourcereference || '—' }}
                    <Icon v-if="c.sourcereference_exact_match" name="lucide:check-circle" class="h-3 w-3 inline text-success" title="Source ref exact match" />
                  </td>
                  <td class="text-xs max-w-xs truncate" :title="c.description">{{ c.description || '—' }}</td>
                  <td class="text-right font-mono">{{ c.currency }} {{ formatAmount(c.amount) }}</td>
                  <td class="text-xs">{{ c.transactiondate || '—' }}</td>
                  <td class="text-right">
                    <span v-if="c.confidence === null" class="text-base-content/40">—</span>
                    <span v-else :class="['badge badge-sm', confidenceBadge(c.confidence)]">{{ c.confidence }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <fieldset class="fieldset mt-3">
          <legend class="fieldset-legend">Notes (optional)</legend>
          <textarea v-model="verifyNotes" rows="2" class="textarea textarea-bordered w-full" placeholder="Internal notes for the audit trail..."></textarea>
        </fieldset>

        <div class="modal-action flex-wrap gap-2">
          <button class="btn" @click="closeVerify">Cancel</button>
          <button
            class="btn btn-success"
            :disabled="busy || !selectedBtId"
            @click="confirmClaimAndSettle"
          >
            <span v-if="busy">Settling...</span>
            <span v-else><Icon name="lucide:check" /> Claim &amp; settle</span>
          </button>
        </div>
      </div>
    </dialog>

    <!-- Cancel modal -->
    <dialog id="pop_cancel_modal" class="modal">
      <div class="modal-box max-w-lg">
        <div class="flex items-center justify-between border-b border-base-200 pb-2">
          <h3 class="text-lg font-bold">Cancel proof of payment</h3>
          <button class="btn btn-ghost btn-circle" @click="closeCancel">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="mt-3 text-sm text-base-content/70">
          The invoice <span class="font-mono">{{ activeInvoice?.invoice_number }}</span>
          will be returned to <span class="badge badge-warning badge-sm">PENDING</span> so the user can resubmit.
          Your comment will be shared with the user.
        </p>
        <fieldset class="fieldset mt-3">
          <legend class="fieldset-legend">Reason (required)</legend>
          <textarea
            v-model="cancelNotes"
            rows="4"
            class="textarea textarea-bordered w-full"
            placeholder="Explain what's wrong with the proof of payment..."
          ></textarea>
          <p v-if="cancelError" class="mt-1 text-xs text-error">{{ cancelError }}</p>
        </fieldset>
        <div class="modal-action">
          <button class="btn" @click="closeCancel">Back</button>
          <button class="btn btn-error" :disabled="busy" @click="confirmCancel">
            <span v-if="busy">Cancelling...</span>
            <span v-else><Icon name="lucide:x-circle" /> Cancel POP</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })
useHead({ title: 'POP Verifications' })

const helper = usePopVerificationHelper()
const { can } = useCheckPermission()
const canAccess = computed(() => can('can.verify.payments'))

const items = ref([])
const meta = ref({ current_page: 1, last_page: 1, total: 0, per_page: 200 })
const loading = ref(false)
const type = ref('REGISTRATION')
const searchInput = ref('')
const activeInvoice = ref(null)
const verifyNotes = ref('')
const cancelNotes = ref('')
const cancelError = ref('')
const busy = ref(false)
const candidates = ref([])
const pop = ref(null)
const wallet = ref([])
const searching = ref(false)
const selectedBtId = ref(null)
const manualQuery = ref('')
const searchMode = ref('auto')   // 'auto' (scored) or 'manual' (LIKE search)
const nowTick = ref(Date.now())
let searchTimer = null
let clockTimer = null

const isWeekend = date => date.getDay() === 0 || date.getDay() === 6

const nextDayStart = (date) => {
  const next = new Date(date)
  next.setHours(24, 0, 0, 0)
  return next
}

const businessMillisecondsBetween = (fromValue, toValue) => {
  const from = new Date(fromValue)
  const to = new Date(toValue)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) return 0

  let total = 0
  let cursor = new Date(from)
  while (cursor < to) {
    const boundary = nextDayStart(cursor)
    const segmentEnd = boundary < to ? boundary : to
    if (!isWeekend(cursor)) total += segmentEnd.getTime() - cursor.getTime()
    cursor = boundary
  }
  return total
}

const addBusinessHours = (fromValue, hours) => {
  let cursor = new Date(fromValue)
  if (Number.isNaN(cursor.getTime())) return null

  let remaining = hours * 60 * 60 * 1000
  while (remaining > 0) {
    if (isWeekend(cursor)) {
      cursor = nextDayStart(cursor)
      continue
    }

    const boundary = nextDayStart(cursor)
    const available = boundary.getTime() - cursor.getTime()
    const consumed = Math.min(available, remaining)
    cursor = new Date(cursor.getTime() + consumed)
    remaining -= consumed
  }
  return cursor
}

const submittedAt = inv => inv.latest_transaction?.created_at || inv.created_at

const queueStage = (inv) => {
  const submitted = submittedAt(inv)
  const elapsed = businessMillisecondsBetween(submitted, nowTick.value)
  if (elapsed >= 48 * 60 * 60 * 1000) return 'manual'
  if (inv.latest_transaction?.first_verification_at || Number(inv.latest_transaction?.verification_attempts) > 0) return 'progress'
  return 'pending'
}

const kanbanColumns = computed(() => [
  {
    key: 'pending',
    title: 'Pending verification',
    description: 'Submitted and waiting for the first verification attempt.',
    icon: 'lucide:inbox',
    iconClass: 'bg-info/10 text-info',
    badgeClass: 'badge-info',
    items: items.value.filter(inv => queueStage(inv) === 'pending'),
  },
  {
    key: 'progress',
    title: 'Verification in progress',
    description: 'Automatic or officer verification has started.',
    icon: 'lucide:loader-circle',
    iconClass: 'bg-warning/10 text-warning',
    badgeClass: 'badge-warning',
    items: items.value.filter(inv => queueStage(inv) === 'progress'),
  },
  {
    key: 'manual',
    title: 'Forwarded for manual verification',
    description: 'Unresolved after 48 hours, excluding weekends.',
    icon: 'lucide:user-round-search',
    iconClass: 'bg-error/10 text-error',
    badgeClass: 'badge-error',
    items: items.value.filter(inv => queueStage(inv) === 'manual'),
  },
])

const deadlineLabel = (inv) => {
  const submitted = submittedAt(inv)
  if (!submitted) return 'Submission time unavailable'

  const deadline = addBusinessHours(submitted, 48)
  if (!deadline) return 'Deadline unavailable'

  if (nowTick.value >= deadline.getTime()) {
    const overdueHours = Math.floor(businessMillisecondsBetween(deadline, nowTick.value) / 3600000)
    return overdueHours > 0 ? `Forwarded ${overdueHours} business hour${overdueHours === 1 ? '' : 's'} ago` : 'Forwarded for manual verification'
  }

  const remainingHours = Math.ceil(businessMillisecondsBetween(nowTick.value, deadline) / 3600000)
  return `${remainingHours} business hour${remainingHours === 1 ? '' : 's'} remaining`
}

const deadlineTone = inv => queueStage(inv) === 'manual'
  ? 'bg-error/10 text-error'
  : queueStage(inv) === 'progress'
    ? 'bg-warning/10 text-warning'
    : 'bg-info/10 text-info'

const confidenceBadge = (n) => {
  const v = Number(n) || 0
  if (v >= 60) return 'badge-success'
  if (v >= 30) return 'badge-warning'
  return 'badge-ghost'
}

const matchStatusLabel = (status) => {
  if (status === 'MATCH_FAILED') return 'Match failed'
  if (status === 'PENDING') return 'Matching'
  if (status === 'VERIFIED') return 'Verified'
  if (status === 'REJECTED') return 'Rejected'
  return status || 'Awaiting review'
}

const matchStatusBadge = (status) => {
  if (status === 'MATCH_FAILED' || status === 'REJECTED') return 'badge-error'
  if (status === 'VERIFIED') return 'badge-success'
  if (status === 'PENDING') return 'badge-warning'
  return 'badge-ghost'
}

const openPop = async (invoiceId) => {
  const { data, error } = await helper.popUrl(invoiceId)
  if (error.value) return
  const url = data.value?.data?.url
  if (url) window.open(url, '_blank', 'noopener')
}

const fetchList = async (page = 1) => {
  loading.value = true
  const { data, error } = await helper.list({
    page,
    per_page: meta.value.per_page,
    type: type.value,
    search: searchInput.value || undefined,
  })
  if (!error.value) {
    const payload = data.value?.data ?? {}
    items.value = payload.data ?? []
    meta.value = {
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
      total: payload.total ?? 0,
      per_page: payload.per_page ?? meta.value.per_page,
    }
  }
  loading.value = false
}

const reload = () => fetchList(1)
const goTo = (p) => fetchList(p)
const setType = (t) => {
  if (type.value === t) return
  type.value = t
  reload()
}
const onSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchList(1), 300)
}

const openVerify = (inv) => {
  activeInvoice.value = inv
  verifyNotes.value = ''
  candidates.value = []
  pop.value = inv?.latest_transaction || null  // seed from list payload; refresh from /search response below
  wallet.value = []
  selectedBtId.value = null
  manualQuery.value = ''
  searchMode.value = 'auto'
  document.getElementById('pop_verify_modal').showModal()
  runSearch()
}
const closeVerify = () => document.getElementById('pop_verify_modal').close()

const runSearch = async () => {
  if (!activeInvoice.value) return
  searchMode.value = 'auto'
  selectedBtId.value = null
  searching.value = true
  const { data, error } = await helper.searchBankTransactions(activeInvoice.value.id)
  searching.value = false
  if (!error.value) {
    const payload = data.value?.data ?? {}
    candidates.value = payload.results ?? []
    pop.value = payload.pop ?? pop.value
    wallet.value = payload.wallet ?? []
  } else {
    candidates.value = []
  }
}

const runManualSearch = async () => {
  if (!activeInvoice.value) return
  const q = manualQuery.value.trim()
  if (q.length < 3) return
  searchMode.value = 'manual'
  selectedBtId.value = null
  searching.value = true
  const { data, error } = await helper.manualBankSearch(activeInvoice.value.id, q)
  searching.value = false
  if (!error.value) {
    candidates.value = data.value?.data?.results ?? []
  } else {
    candidates.value = []
  }
}

const openCancel = (inv) => {
  activeInvoice.value = inv
  cancelNotes.value = ''
  cancelError.value = ''
  document.getElementById('pop_cancel_modal').showModal()
}
const closeCancel = () => document.getElementById('pop_cancel_modal').close()

const confirmClaimAndSettle = async () => {
  if (!activeInvoice.value || !selectedBtId.value) return
  busy.value = true
  const { error } = await helper.claimAndSettle(activeInvoice.value.id, {
    bank_transaction_id: selectedBtId.value,
    notes: verifyNotes.value || null,
  })
  busy.value = false
  if (!error.value) {
    closeVerify()
    await fetchList(meta.value.current_page)
  }
}


const confirmCancel = async () => {
  if (!activeInvoice.value) return
  if (!cancelNotes.value || cancelNotes.value.trim().length < 5) {
    cancelError.value = 'Please provide at least 5 characters explaining the issue.'
    return
  }
  busy.value = true
  cancelError.value = ''
  const { error } = await helper.cancel(activeInvoice.value.id, { notes: cancelNotes.value })
  busy.value = false
  if (!error.value) {
    closeCancel()
    await fetchList(meta.value.current_page)
  }
}

const formatAmount = (v) => {
  const n = Number(v)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const formatDate = (v) => {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString()
}

onMounted(() => {
  clockTimer = window.setInterval(() => {
    nowTick.value = Date.now()
  }, 60000)
  if (canAccess.value) fetchList(1)
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
  if (clockTimer) clearInterval(clockTimer)
})
</script>
