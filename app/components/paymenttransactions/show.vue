<template>
  <div>
    <button class="btn btn-sm btn-ghost" @click="openModal">
      <Icon name="lucide:file-text" />
      <span class="hidden md:block">Details</span>
    </button>

    <dialog :id="`pt_show_modal_${item.id}`" class="modal">
      <div class="modal-box max-w-3xl">
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-base-200 pb-3">
          <div>
            <h3 class="text-lg font-bold">Transaction Details</h3>
            <p class="text-sm text-base-content/60">
              #{{ item.id }} &nbsp;·&nbsp;
              <code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{{ item.source_reference ?? '—' }}</code>
            </p>
          </div>
          <button
            class="btn btn-ghost btn-circle btn-sm"
            :onclick="`document.getElementById('pt_show_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <template v-else-if="tx">
          <!-- Status bar -->
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="badge badge-lg" :class="statusClass(tx.status)">{{ tx.status }}</span>
            <span v-if="tx.flagged_for_manual" class="badge badge-error badge-lg">Flagged for Manual</span>
            <span v-if="tx.verified_by" class="text-sm text-base-content/60">
              Verified by <span class="font-medium text-base-content">{{ tx.verified_by }}</span>
              on {{ formatDate(tx.verified_at) }}
            </span>
          </div>

          <!-- Details grid -->
          <div class="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
            <div>
              <span class="block text-xs text-base-content/50">Company</span>
              <span class="font-medium">{{ tx.company_name ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Invoice</span>
              <span class="font-medium">{{ tx.invoice_number ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Amount</span>
              <span class="font-mono font-semibold">
                {{ tx.currency_code }} {{ Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Payment Date</span>
              <span>{{ formatDate(tx.payment_date) }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Payment Method</span>
              <span>{{ tx.method ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Channel</span>
              <span>{{ tx.channel ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Source Reference</span>
              <code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{{ tx.source_reference ?? '—' }}</code>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">STAN Code</span>
              <code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{{ tx.stan_code ?? '—' }}</code>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Gateway Reference</span>
              <code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{{ tx.gateway_reference ?? '—' }}</code>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Source Bank</span>
              <span>{{ tx.source_bank ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Account Name</span>
              <span>{{ tx.account_name ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Account Number</span>
              <span>{{ tx.account_number ?? '—' }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Verification Attempts</span>
              <span class="font-semibold">{{ tx.verification_attempts ?? 0 }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">First Attempt</span>
              <span>{{ formatDateTime(tx.first_verification_at) }}</span>
            </div>
            <div>
              <span class="block text-xs text-base-content/50">Last Attempt</span>
              <span>{{ formatDateTime(tx.last_verification_at) }}</span>
            </div>
            <div v-if="tx.notes" class="col-span-2 md:col-span-3">
              <span class="block text-xs text-base-content/50">Notes</span>
              <span>{{ tx.notes }}</span>
            </div>
          </div>

          <!-- Attachment -->
          <div class="mt-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50">Proof of Payment</p>

            <div v-if="!tx.has_attachment" class="rounded-lg border border-dashed border-base-300 py-6 text-center text-sm text-base-content/40">
              <Icon name="lucide:file-x" class="mx-auto mb-1 h-5 w-5" />
              No attachment submitted
            </div>

            <div v-else class="rounded-lg border border-base-200 overflow-hidden">
              <!-- PDF viewer -->
              <template v-if="tx.attachment_extension === 'pdf'">
                <iframe
                  :src="attachmentUrl"
                  class="h-[28rem] w-full"
                  title="Proof of Payment"
                />
              </template>

              <!-- Image viewer -->
              <template v-else>
                <img
                  :src="attachmentUrl"
                  alt="Proof of Payment"
                  class="max-h-[28rem] w-full object-contain bg-base-200"
                />
              </template>

              <div class="flex items-center justify-end border-t border-base-200 bg-base-100 px-3 py-2">
                <a
                  :href="attachmentUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-ghost btn-xs gap-1"
                >
                  <Icon name="lucide:external-link" class="h-3.5 w-3.5" />
                  Open in new tab
                </a>
              </div>
            </div>
          </div>
        </template>

        <div class="modal-action">
          <button class="btn btn-sm" :onclick="`document.getElementById('pt_show_modal_${item.id}').close()`">
            Close
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } })

const store = usePaymentTransactionStore()
const tx = ref(null)
const loading = ref(false)

const attachmentUrl = computed(() => store.getAttachmentUrl(props.item.id))

const openModal = async () => {
  document.getElementById(`pt_show_modal_${props.item.id}`).showModal()
  if (tx.value) return
  loading.value = true
  tx.value = await store.fetchOne(props.item.id)
  loading.value = false
}

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatDateTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const statusClass = (status) => ({
  'badge-warning': status === 'PENDING',
  'badge-success': status === 'VERIFIED',
  'badge-error': status === 'REJECTED',
})
</script>
