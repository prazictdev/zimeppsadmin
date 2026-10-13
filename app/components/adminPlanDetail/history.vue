<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Workflow History</span>
        <span class="text-xs text-base-content/60">Admin-side activity only</span>
      </div>
      <div class="overflow-x-auto">
        <table class="table table-sm mt-3 w-full text-sm">
          <thead>
            <tr class="text-left">
              <th>#</th>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>Status change</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!adminTransitions.length">
              <td colspan="6" class="text-center text-base-content/50">No admin activity yet.</td>
            </tr>
            <tr v-for="(t, i) in adminTransitions" :key="t.id ?? i">
              <td>{{ i + 1 }}</td>
              <td>{{ formatTime(t.created_at) }}</td>
              <td>{{ t.user?.name || '—' }}</td>
              <td>
                <span :class="['badge', actionBadge(t.action)]">{{ actionLabel(t.action) }}</span>
              </td>
              <td class="font-mono text-xs">{{ t.from_status }} → {{ t.to_status }}</td>
              <td class="max-w-md whitespace-pre-line">
                <div>{{ t.comment || '—' }}</div>
                <span
                  v-if="t.ai_overridden"
                  class="badge badge-warning badge-sm mt-1 gap-1"
                  :title="`AI recommended ${formatAiDecision(t.ai_decision)} — the user proceeded against it`"
                >
                  <Icon name="lucide:alert-triangle" class="h-3 w-3" />
                  Overrode AI ({{ formatAiDecision(t.ai_decision) }})
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useAdminPlanStore();

const ADMIN_ACTIONS = new Set([
  'handler_recommend',
  'manager_agree',
  'manager_disagree',
  'approver_approve',
  'approver_send_back_to_manager',
  'approver_send_back_to_pe',
]);

const adminTransitions = computed(() =>
  (store.transitions ?? []).filter((t) => ADMIN_ACTIONS.has(t.action)),
);

const formatTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
};

const formatAiDecision = (d) => ({
  SEND_BACK_TO_PE: 'send back',
  NEEDS_CORRECTIONS: 'needs corrections',
  APPROVE: 'approve',
  READY: 'ready',
})[d] ?? (d || 'n/a');

const actionLabel = (a) => ({
  submit_for_review: 'Submitted for Review',
  review_approve: 'Review Approved',
  review_send_back: 'Sent Back to Creator',
  approve: 'Approved Internally',
  approve_send_back: 'Sent Back (Internal)',
  handler_recommend: 'Handler Recommended',
  manager_agree: 'Manager Agreed',
  manager_disagree: 'Manager Disagreed',
  approver_approve: 'Approved by Approver',
  approver_send_back_to_manager: 'Sent Back to Manager',
  approver_send_back_to_pe: 'Sent Back to PE',
})[a] ?? a;

const actionBadge = (a) => {
  if (['review_approve', 'approve', 'manager_agree', 'approver_approve'].includes(a)) return 'badge-success';
  if (['review_send_back', 'approve_send_back', 'manager_disagree', 'approver_send_back_to_manager', 'approver_send_back_to_pe'].includes(a)) return 'badge-warning';
  return 'badge-info';
};
</script>
