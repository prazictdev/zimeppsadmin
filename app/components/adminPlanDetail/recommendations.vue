<template>
  <div class="card border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Recommendations</span>
        <span class="text-xs text-base-content/60">
          {{ store.recommendations.length }} cycle{{ store.recommendations.length === 1 ? '' : 's' }}
        </span>
      </div>

      <div v-if="!store.recommendations.length" class="py-6 text-center text-sm text-base-content/60">
        No recommendation has been written yet.
      </div>

      <div v-else class="mt-3 space-y-3">
        <div v-for="rec in sortedRecommendations" :key="rec.id" class="rounded border border-base-200 p-3">
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
              <span
                v-if="rec.handler_ai_overridden"
                class="badge badge-warning badge-sm mt-1 gap-1"
                :title="`AI recommended ${formatAiDecision(rec.handler_ai_decision)}`"
              >
                <Icon name="lucide:alert-triangle" class="h-3 w-3" />
                Overrode AI ({{ formatAiDecision(rec.handler_ai_decision) }})
              </span>
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
              <span
                v-if="rec.approver_ai_overridden"
                class="badge badge-warning badge-sm mt-1 gap-1"
                :title="`AI recommended ${formatAiDecision(rec.approver_ai_decision)}`"
              >
                <Icon name="lucide:alert-triangle" class="h-3 w-3" />
                Overrode AI ({{ formatAiDecision(rec.approver_ai_decision) }})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const store = useAdminPlanStore();

const sortedRecommendations = computed(() =>
  [...store.recommendations].sort((a, b) => (b.cycle ?? 0) - (a.cycle ?? 0)),
);

const formatUser = (u) => {
  if (!u) return '—';
  return `${u.name ?? ''} ${u.lastname ?? ''}`.trim() || u.email || '—';
};

const formatTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
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

const formatAiDecision = (d) => ({
  SEND_BACK_TO_PE: 'send back',
  NEEDS_CORRECTIONS: 'needs corrections',
  APPROVE: 'approve',
  READY: 'ready',
})[d] ?? (d || 'n/a');
</script>
