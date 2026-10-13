<template>
  <div class="inline-flex">
    <button v-if="!autoOpen" class="btn btn-ghost btn-xs" @click="open">
      <Icon name="lucide:eye" />
      Open
    </button>

    <dialog :id="dialogId" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none">
        <div class="flex items-center justify-between border-b border-base-200 pb-2">
          <div>
            <h3 class="text-lg font-bold">
              {{ supplement.title || 'Supplement' }}
              <span class="text-sm font-normal text-base-content/60">· {{ formatStatus(s?.status) }}</span>
            </h3>
            <p v-if="s?.reason" class="text-xs text-base-content/60 max-w-3xl">{{ s.reason }}</p>
            <p v-if="s?.requester" class="text-xs text-base-content/50">
              Requested by {{ formatUser(s.requester) }}<span v-if="s.requested_at"> · {{ formatTime(s.requested_at) }}</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <AdminPlanDetailSupplementActionPanel v-if="s" :plan-uuid="planUuid" :supplement="s" />
            <button class="btn btn-ghost btn-circle" @click="close">
              <Icon name="lucide:x" />
            </button>
          </div>
        </div>

        <div v-if="!s" class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else class="mt-3 space-y-4">
          <!-- Items -->
          <section class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">
              Items ({{ s.items?.length ?? 0 }})
            </div>
            <table class="table table-sm w-full">
              <thead>
                <tr class="text-left">
                  <th>Ref</th>
                  <th>Description</th>
                  <th>Method</th>
                  <th>Group</th>
                  <th class="text-right">Qty</th>
                  <th class="text-right">Unit cost</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!s.items?.length">
                  <td colspan="7" class="text-center text-base-content/50">No items.</td>
                </tr>
                <tr v-for="it in s.items ?? []" :key="it.id">
                  <td class="font-mono text-xs">{{ it.reference_no || '—' }}</td>
                  <td class="max-w-md truncate" :title="it.description">{{ it.description }}</td>
                  <td>{{ it.procurementmethod?.name || '—' }}</td>
                  <td>{{ it.procurementgroup?.name || '—' }}</td>
                  <td class="text-right font-mono">{{ formatAmount(it.quantity) }}</td>
                  <td class="text-right font-mono">{{ formatAmount(it.unit_cost) }}</td>
                  <td class="text-right font-mono">{{ formatAmount(it.total_cost) }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- Recommendations -->
          <section v-if="s.recommendations?.length" class="rounded border border-base-200">
            <div class="border-b border-base-200 bg-base-200/40 px-3 py-2 text-sm font-semibold">
              Recommendations ({{ s.recommendations.length }} cycle{{ s.recommendations.length === 1 ? '' : 's' }})
            </div>
            <div class="space-y-3 p-3">
              <div v-for="rec in sortedRecs" :key="rec.id" class="rounded border border-base-200 p-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-semibold">Cycle {{ rec.cycle }}</span>
                  <span :class="['badge badge-sm', rec.handler_recommendation === 'APPROVE' ? 'badge-success' : 'badge-warning']">
                    Handler: {{ rec.handler_recommendation === 'APPROVE' ? 'Approve' : 'Send Back' }}
                  </span>
                </div>
                <div class="mt-2 space-y-2 text-sm">
                  <div>
                    <p class="text-xs uppercase text-base-content/60">Handler</p>
                    <p>{{ formatUser(rec.handler) }} · {{ formatTime(rec.handler_created_at) }}</p>
                    <p v-if="rec.handler_comment" class="italic text-base-content/70">"{{ rec.handler_comment }}"</p>
                  </div>
                  <div v-if="rec.manager_action">
                    <p class="text-xs uppercase text-base-content/60">Manager</p>
                    <p class="flex items-center gap-2">
                      {{ formatUser(rec.manager) }}
                      <span :class="['badge badge-sm', rec.manager_action === 'AGREE' ? 'badge-success' : 'badge-warning']">
                        {{ rec.manager_action === 'AGREE' ? 'Agreed' : 'Disagreed' }}
                      </span>
                      <span class="text-xs text-base-content/60">· {{ formatTime(rec.manager_actioned_at) }}</span>
                    </p>
                    <p v-if="rec.manager_comment" class="italic text-base-content/70">"{{ rec.manager_comment }}"</p>
                  </div>
                  <div v-if="rec.approver_action">
                    <p class="text-xs uppercase text-base-content/60">Approver</p>
                    <p class="flex items-center gap-2">
                      {{ formatUser(rec.approver) }}
                      <span :class="['badge badge-sm', approverBadge(rec.approver_action)]">
                        {{ approverLabel(rec.approver_action) }}
                      </span>
                      <span class="text-xs text-base-content/60">· {{ formatTime(rec.approver_actioned_at) }}</span>
                    </p>
                    <p v-if="rec.approver_comment" class="italic text-base-content/70">"{{ rec.approver_comment }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  planUuid: { type: String, required: true },
  supplement: { type: Object, required: true },
  autoOpen: { type: Boolean, default: false },
});
const emit = defineEmits(['closed']);

const store = useAdminPlanStore();
const dialogId = computed(() => `admin_supp_detail_${props.supplement.uuid}`);

const s = computed(() => store.currentSupplement);
const sortedRecs = computed(() =>
  [...(s.value?.recommendations ?? [])].sort((a, b) => (b.cycle ?? 0) - (a.cycle ?? 0)),
);

const open = async () => {
  const dialog = document.getElementById(dialogId.value);
  if (dialog && !dialog.open) dialog.showModal();
  await store.loadSupplement(props.planUuid, props.supplement.uuid);
};
const close = () => {
  document.getElementById(dialogId.value)?.close();
  emit('closed');
};

const formatStatus = (s) => {
  if (!s) return '—';
  return s.split('_').map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
};

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
};

const formatUser = (u) => {
  if (!u) return '—';
  return [u.name, u.lastname].filter(Boolean).join(' ') || u.email || '—';
};

const approverLabel = (a) => ({
  APPROVE: 'Approved',
  SEND_BACK_TO_MANAGER: 'Sent to Manager',
  SEND_BACK_TO_PE: 'Sent to PE',
})[a] ?? a;

const approverBadge = (a) => ({
  APPROVE: 'badge-success',
  SEND_BACK_TO_MANAGER: 'badge-warning',
  SEND_BACK_TO_PE: 'badge-error',
})[a] ?? 'badge-ghost';

onMounted(async () => {
  if (props.autoOpen) {
    await nextTick();
    await open();
  }
});
</script>
