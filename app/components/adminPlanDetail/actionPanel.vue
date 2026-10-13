<template>
  <div v-if="store.workflowActions.length" class="inline-flex">
    <button class="btn btn-neutral btn-sm" @click="openPanel">
      <Icon name="lucide:gavel" />
      {{ isApproverReview ? 'Approver review' : isManagerReview ? 'Manager review' : 'Action' }}
    </button>

    <!-- Panel modal -->
    <dialog id="admin_action_panel_modal" class="modal" aria-labelledby="admin_action_panel_title">
      <div :class="['modal-box', isReviewPanel ? 'max-w-4xl overflow-y-auto rounded-2xl p-0' : 'max-w-3xl']">
        <header v-if="isReviewPanel" class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-base-300 bg-base-100 px-5 py-5 sm:px-6">
          <div class="flex items-start gap-3">
            <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon name="lucide:clipboard-check" class="h-6 w-6" /></span>
            <div><p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Annual procurement plan</p><h3 id="admin_action_panel_title" class="mt-1 text-xl font-bold">{{ isApproverReview ? 'Approver review' : 'Manager review' }}</h3><p class="mt-1 text-sm text-base-content/60">{{ isApproverReview ? 'Review the recommendation chain and record the final decision.' : 'Review the handler’s recommendation and choose the next step.' }}</p></div>
          </div>
          <button type="button" class="btn btn-ghost btn-circle btn-sm shrink-0" :aria-label="isApproverReview ? 'Close approver review' : 'Close manager review'" :disabled="saving" @click="closePanel"><Icon name="lucide:x" class="h-5 w-5" /></button>
        </header>
        <div v-else class="flex items-center justify-between border-b border-base-200 pb-2">
          <h3 id="admin_action_panel_title" class="text-lg font-bold">Available Actions</h3>
          <div class="flex items-center gap-2">
            <span class="text-xs text-base-content/60">Stage: {{ formatStatus(store.plan?.status) }}</span>
            <button class="btn btn-ghost btn-circle" @click="closePanel">
              <Icon name="lucide:x" />
            </button>
          </div>
        </div>

        <!-- Handler recommendation form -->
        <div v-if="canHandlerRecommend" class="mt-3 space-y-3">
          <p class="text-sm">Write your recommendation for this plan.</p>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label class="flex items-center gap-2 cursor-pointer rounded border border-base-200 p-3" :class="{ 'border-success bg-success/10': handlerForm.recommendation === 'APPROVE' }">
              <input v-model="handlerForm.recommendation" type="radio" value="APPROVE" class="radio radio-success radio-sm" />
              <div>
                <p class="font-medium">Approve</p>
                <p class="text-xs text-base-content/60">Forward to manager for review.</p>
              </div>
            </label>
            <label class="flex items-center gap-2 cursor-pointer rounded border border-base-200 p-3" :class="{ 'border-warning bg-warning/10': handlerForm.recommendation === 'SEND_BACK' }">
              <input v-model="handlerForm.recommendation" type="radio" value="SEND_BACK" class="radio radio-warning radio-sm" />
              <div>
                <p class="font-medium">Send Back</p>
                <p class="text-xs text-base-content/60">Recommend sending the plan back to the PE.</p>
              </div>
            </label>
          </div>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Forward to manager (required)</legend>
            <select v-model.number="handlerForm.manager_user_id" class="select select-bordered select-sm">
              <option :value="0">— select a manager —</option>
              <option v-for="m in managerCandidates" :key="m.id" :value="m.id">
                {{ m.name }} {{ m.lastname || '' }} <span v-if="m.email">· {{ m.email }}</span>
              </option>
            </select>
            <p v-if="loadingCandidates" class="text-xs text-base-content/60">Loading...</p>
            <p v-else-if="!managerCandidates.length" class="text-xs text-warning">No users with manager permission found.</p>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Comment (required)</legend>
            <textarea v-model="handlerForm.comment" rows="4" class="textarea textarea-bordered w-full" placeholder="Explain your recommendation."></textarea>
          </fieldset>
          <p v-if="handlerError" role="alert" class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{{ handlerError }}</p>
          <div class="flex justify-end">
            <button class="btn btn-primary btn-sm" :disabled="!canSubmitHandler || saving" @click="submitHandlerRecommend">
              <span v-if="saving">Submitting...</span>
              <span v-else>Submit recommendation</span>
            </button>
          </div>
        </div>

        <div v-else-if="isReviewPanel" class="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section class="min-w-0 space-y-5 border-b border-base-300 bg-base-200/35 p-5 sm:p-6 md:border-b-0 md:border-r">
            <div><p class="text-xs font-semibold uppercase tracking-wide text-base-content/50">Application under review</p><h4 class="mt-2 break-words text-lg font-bold">{{ store.plan?.company?.name || 'Procurement entity' }}</h4><div class="mt-2 flex flex-wrap gap-2"><span class="badge badge-outline badge-sm">{{ store.plan?.year }} plan</span><span v-if="store.plan?.procurementclass?.name" class="badge badge-ghost badge-sm">{{ store.plan.procurementclass.name }}</span><span class="badge badge-primary badge-outline badge-sm">{{ isApproverReview ? 'Final decision' : 'Manager review' }}</span></div></div>
            <article v-if="latestRecommendation" class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 p-4"><h4 class="text-sm font-semibold">Handler recommendation</h4><span :class="['badge badge-sm', latestRecommendation.handler_recommendation === 'APPROVE' ? 'badge-success' : 'badge-warning']">{{ latestRecommendation.handler_recommendation === 'APPROVE' ? 'Approve' : 'Send back to entity' }}</span></div>
              <div class="space-y-4 p-4"><p class="whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/80">{{ latestRecommendation.handler_comment || 'No handler comment recorded.' }}</p><div class="flex items-center gap-2 border-t border-base-200 pt-3"><Icon name="lucide:user-round" class="h-4 w-4 shrink-0 text-base-content/40" /><div class="min-w-0 text-xs"><p class="break-words font-semibold">{{ handlerName }}</p><p class="mt-0.5 text-base-content/50">Recommendation cycle {{ latestRecommendation.cycle || 1 }}</p></div></div></div>
            </article>
            <p v-else class="rounded-xl border border-dashed border-base-300 p-4 text-sm text-base-content/60">No handler recommendation is available for this plan.</p>
            <article v-if="isApproverReview && latestRecommendation" class="overflow-hidden rounded-xl border border-base-300 bg-base-100">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 p-4"><h4 class="text-sm font-semibold">Manager review</h4><span :class="['badge badge-sm', latestRecommendation.manager_action === 'AGREE' ? 'badge-success' : 'badge-warning']">{{ latestRecommendation.manager_action === 'AGREE' ? 'Agreed' : latestRecommendation.manager_action === 'DISAGREE' ? 'Disagreed' : 'Not recorded' }}</span></div>
              <div class="space-y-4 p-4"><p class="whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/80">{{ latestRecommendation.manager_comment || 'No manager comment recorded.' }}</p><div class="flex items-center gap-2 border-t border-base-200 pt-3"><Icon name="lucide:user-round-check" class="h-4 w-4 shrink-0 text-base-content/40" /><p class="break-words text-xs font-semibold">{{ managerName }}</p></div></div>
            </article>
          </section>
          <section class="space-y-4 p-5 sm:p-6">
            <div><h4 class="font-bold">Your decision</h4><p class="mt-1 text-sm text-base-content/60">Choose an option to record your review.</p></div>
            <button v-for="action in reviewActions" :key="action" type="button" class="group flex w-full items-start gap-3 rounded-xl border border-base-300 p-4 text-left transition hover:border-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary" :disabled="saving" @click="openAction(action)">
              <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', ['manager_agree', 'approver_approve'].includes(action) ? 'bg-success/10 text-success' : action === 'approver_send_back_to_pe' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning']"><Icon :name="actionIcon(action)" class="h-5 w-5" /></span>
              <span class="min-w-0 flex-1"><span class="block text-sm font-bold">{{ reviewCard(action).title }}</span><span class="mt-1 block text-xs leading-relaxed text-base-content/60">{{ reviewCard(action).description }}</span><span class="mt-3 block text-xs font-semibold text-primary">{{ reviewCard(action).prompt }}</span></span>
              <Icon name="lucide:chevron-right" class="mt-1 h-4 w-4 shrink-0 text-base-content/40" />
            </button>
            <p class="flex items-start gap-2 text-xs leading-relaxed text-base-content/50"><Icon name="lucide:info" class="mt-0.5 h-4 w-4 shrink-0" />You can review your comment before confirming. Your decision will be recorded in workflow history.</p>
          </section>
        </div>

        <!-- Approver actions -->
        <div v-else class="mt-3 space-y-3">
          <p v-if="latestRecommendation" class="text-sm">
            <span class="font-medium">Handler recommendation:</span>
            <span :class="['badge ml-2', latestRecommendation.handler_recommendation === 'APPROVE' ? 'badge-success' : 'badge-warning']">
              {{ latestRecommendation.handler_recommendation === 'APPROVE' ? 'Approve' : 'Send Back' }}
            </span>
          </p>
          <p v-if="latestRecommendation?.handler_comment" class="text-sm italic text-base-content/70">
            "{{ latestRecommendation.handler_comment }}"
          </p>

          <div class="flex flex-wrap gap-2">
            <button
              v-for="action in nonRecommendActions"
              :key="action"
              :class="['btn btn-sm', actionClass(action)]"
              @click="openAction(action)"
            >
              <Icon :name="actionIcon(action)" />
              {{ actionLabel(action) }}
            </button>
          </div>
        </div>

        <div :class="isReviewPanel ? 'flex justify-end border-t border-base-300 bg-base-100 px-5 py-4 sm:px-6' : 'modal-action'">
          <button class="btn" type="button" @click="closePanel">Close</button>
        </div>
      </div>
    </dialog>

    <!-- Inner action confirmation modal (for non-handler actions) -->
    <dialog id="admin_action_modal" class="modal" aria-labelledby="admin_action_title">
      <div class="modal-box max-w-2xl rounded-2xl p-0">
        <div class="flex items-start justify-between gap-4 border-b border-base-300 px-5 py-5 sm:px-6">
          <div><p v-if="isManagerAction || isApproverAction" class="mb-1 text-xs font-semibold uppercase tracking-wider text-base-content/50">{{ isApproverAction ? 'Final regulatory decision' : 'Manager decision' }}</p><h3 id="admin_action_title" class="text-lg font-bold">{{ activeAction ? actionLabel(activeAction) : '' }}</h3><p v-if="isManagerAction || isApproverAction" class="mt-1 text-xs text-base-content/60">{{ store.plan?.company?.name }} · {{ store.plan?.year }} plan</p></div>
          <button class="btn btn-ghost btn-circle btn-sm shrink-0" aria-label="Close action confirmation" :disabled="saving" @click="closeAction">
            <Icon name="lucide:x" />
          </button>
        </div>
        <div class="space-y-5 px-5 py-5 text-sm sm:px-6">
          <div class="flex items-start gap-3 rounded-xl border border-base-300 bg-base-200/40 p-4"><Icon :name="activeAction ? actionIcon(activeAction) : 'lucide:info'" class="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p class="leading-relaxed text-base-content/75">{{ activeAction ? actionDescription(activeAction) : '' }}</p></div>
          <fieldset v-if="activeAction === 'approver_approve'" class="fieldset">
            <legend class="fieldset-legend">Procurement class decision</legend>
            <p class="text-sm">Applied-for class: <strong>{{ store.plan?.procurementclass?.name || 'Not specified' }}</strong></p>
            <label class="mt-2 flex items-center gap-2"><input v-model="classDecision" type="radio" value="MAINTAIN" class="radio radio-sm" :disabled="saving" /> Maintain applied-for class</label>
            <label class="mt-2 flex items-center gap-2"><input v-model="classDecision" type="radio" value="CHANGE" class="radio radio-sm" :disabled="saving" @change="loadClasses" /> Change class</label>
            <template v-if="classDecision === 'CHANGE'">
              <label for="approved_procurement_class" class="mt-2 font-medium">Approve as class</label>
              <select id="approved_procurement_class" v-model.number="approvedClassId" class="select select-bordered w-full" :disabled="saving || loadingClasses">
                <option :value="0">Select a procurement class</option>
                <option v-for="entry in procurementClasses" :key="entry.id" :value="entry.id">{{ entry.name }}</option>
              </select>
              <p v-if="loadingClasses">Loading classes…</p>
              <p v-if="classesError" role="alert" class="text-error">{{ classesError }} <button type="button" class="btn btn-ghost btn-xs" @click="loadClasses">Retry</button></p>
            </template>
            <p class="mt-2 text-xs text-base-content/60">The authorization invoice uses the approved class. The applied-for class remains recorded in the approval details.</p>
          </fieldset>
          <fieldset v-if="activeAction === 'manager_agree'" class="fieldset">
            <legend class="fieldset-legend">Forward to approver <span class="text-xs font-normal text-base-content/50">Required</span></legend>
            <select v-model.number="modalApproverId" class="select select-bordered w-full" aria-label="Forward to approver" :disabled="loadingCandidates || saving">
              <option :value="0">— select an approver —</option>
              <option v-for="a in approverCandidates" :key="a.id" :value="a.id">
                {{ a.name }} {{ a.lastname || '' }} <span v-if="a.email">· {{ a.email }}</span>
              </option>
            </select>
            <p v-if="loadingCandidates" class="flex items-center gap-2 text-xs text-base-content/60"><span class="loading loading-spinner loading-xs" /> Loading eligible approvers…</p>
            <p v-else-if="!approverCandidates.length" class="text-xs text-warning">No users with approver permission found.</p>
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend flex w-full items-center justify-between gap-2">
              <span>Comment{{ commentRequired ? ' (required)' : ' (optional)' }}</span>
              <button
                v-if="commentRequired"
                type="button"
                class="btn btn-ghost btn-xs gap-1"
                :disabled="drafting || saving"
                title="Draft this comment with AI from the reviewers' recommendations"
                @click="draftComment"
              >
                <span v-if="drafting" class="loading loading-spinner loading-xs" />
                <Icon v-else name="lucide:bot" class="h-4 w-4" />
                {{ drafting ? 'Drafting…' : 'Draft with AI' }}
              </button>
            </legend>
            <textarea v-model="modalComment" rows="5" class="textarea textarea-bordered w-full leading-relaxed" aria-label="Review comment" :aria-required="commentRequired" :aria-invalid="!!modalError" :aria-describedby="modalError ? 'admin_action_error' : undefined" :placeholder="commentPlaceholder" :disabled="saving"></textarea>
            <p v-if="isManagerAction" class="mt-1 text-xs text-base-content/50">{{ commentRequired ? 'Explain the reason for returning this recommendation.' : 'An optional comment can help the approver understand your decision.' }}</p>
            <p v-if="isApproverAction" class="mt-1 text-xs text-base-content/50">{{ activeAction === 'approver_send_back_to_pe' ? 'State your clarification questions or recommended corrections. This comment will be visible to the entity.' : activeAction === 'approver_send_back_to_manager' ? 'Explain what the manager needs to reconsider before returning the plan.' : 'Optionally record the rationale for your approval.' }}</p>
            <div v-if="modalError" id="admin_action_error" role="alert" class="mt-2 rounded-lg bg-error/10 px-3 py-3 text-sm text-error">
              <p>{{ modalError }}</p>
              <div v-if="classificationBlocker" class="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-error/15 pt-2">
                <span>{{ classificationBlocker.affected_items }} of {{ classificationBlocker.total_items }} items require reviewer confirmation.</span>
                <button type="button" class="btn btn-error btn-xs" @click="openClassificationReview">
                  <Icon name="lucide:scan-search" /> Review classifications
                </button>
              </div>
            </div>
          </fieldset>
        </div>
        <div class="flex flex-wrap justify-end gap-2 border-t border-base-300 bg-base-200/30 px-5 py-4 sm:px-6">
          <button class="btn btn-ghost" type="button" :disabled="saving" @click="closeAction">Cancel</button>
          <button :class="['btn', isManagerAction ? 'btn-neutral' : activeAction ? actionClass(activeAction) : '']" :disabled="saving || drafting || (activeAction === 'manager_agree' && loadingCandidates)" @click="confirm">
            <span v-if="saving" class="loading loading-spinner loading-xs" /><span v-if="saving">Saving decision…</span>
            <span v-else>{{ isManagerAction ? (activeAction === 'manager_agree' ? 'Confirm and forward' : 'Confirm return to handler') : isApproverAction ? approverConfirmation : 'Confirm' }}</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  planUuid: { type: String, required: true },
});

const store = useAdminPlanStore();
const route = useRoute();

const handlerForm = reactive({ recommendation: '', comment: '', manager_user_id: 0 });
const saving = ref(false);
const activeAction = ref(null);
const modalComment = ref('');
const modalApproverId = ref(0);
const modalError = ref('');
const handlerError = ref('');
const classDecision = ref('MAINTAIN');
const approvedClassId = ref(0);
const procurementClasses = ref([]);
const loadingClasses = ref(false);
const classesError = ref('');
const classificationBlocker = computed(() => store.transitionReport?.classification || null);
const openClassificationReview = async () => {
  closeAction();
  closePanel();
  await navigateTo({ path: route.path, query: { ...route.query, tab: 'classification' } });
};
const loadClasses = async () => {
  loadingClasses.value = true;
  classesError.value = '';
  try {
    const { data, error } = await useProcurementClassHelper().getProcurementClasses();
    if (error.value) classesError.value = 'Could not load procurement classes.';
    else procurementClasses.value = (data.value?.data ?? []).filter(entry => entry.status === 'ACTIVE');
  } catch {
    classesError.value = 'Could not load procurement classes.';
  } finally {
    loadingClasses.value = false;
  }
};

const managerCandidates = ref([]);
const approverCandidates = ref([]);
const loadingCandidates = ref(false);

const helper = useAdminPlanHelper();

const loadCandidates = async (stage) => {
  loadingCandidates.value = true;
  const { ok, data } = await helper.fetchEligibleNextActors(props.planUuid, stage);
  if (ok) {
    const list = data?.data ?? [];
    if (stage === 'manager') managerCandidates.value = list;
    if (stage === 'approver') approverCandidates.value = list;
  }
  loadingCandidates.value = false;
};

const COMMENT_REQUIRED = new Set([
  'manager_disagree',
  'approver_send_back_to_manager',
  'approver_send_back_to_pe',
]);

const canHandlerRecommend = computed(() => store.workflowActions.includes('handler_recommend'));
const managerActions = computed(() => store.workflowActions.filter(action => ['manager_agree', 'manager_disagree'].includes(action)));
const isManagerReview = computed(() => !canHandlerRecommend.value && managerActions.value.length > 0);
const approverActions = computed(() => store.workflowActions.filter(action => ['approver_approve', 'approver_send_back_to_manager', 'approver_send_back_to_pe'].includes(action)));
const isApproverReview = computed(() => !canHandlerRecommend.value && !isManagerReview.value && approverActions.value.length > 0);
const isReviewPanel = computed(() => isManagerReview.value || isApproverReview.value);
const reviewActions = computed(() => isApproverReview.value ? approverActions.value : managerActions.value);
const isApproverAction = computed(() => approverActions.value.includes(activeAction.value));
const managerName = computed(() => {
  const manager = latestRecommendation.value?.manager;
  return manager ? `${manager.name || ''} ${manager.lastname || ''}`.trim() || manager.email || 'Assigned manager' : 'Assigned manager';
});
const reviewCard = action => ({
  manager_agree: { title: 'Agree and forward', description: 'Support the recommendation and select an approver for the final decision.', prompt: 'Select approver' },
  manager_disagree: { title: 'Return to handler', description: 'Request changes to the recommendation and explain what needs attention.', prompt: 'Add review comment' },
  approver_approve: { title: 'Approve plan', description: 'Authorize the plan and generate the regulatory invoice for the entity.', prompt: 'Review and confirm approval' },
  approver_send_back_to_manager: { title: 'Return to manager', description: 'Request reconsideration of the recommendation before a final decision.', prompt: 'Explain your reservations' },
  approver_send_back_to_pe: { title: 'Return to procurement entity', description: 'Seek clarification or recommend corrections before the entity resubmits the plan.', prompt: 'Request clarification or corrections' },
})[action];
const approverConfirmation = computed(() => ({ approver_approve: 'Confirm approval', approver_send_back_to_manager: 'Confirm return to manager', approver_send_back_to_pe: 'Confirm return to entity' })[activeAction.value]);
const commentPlaceholder = computed(() => ({
  manager_disagree: 'Explain your concerns and the changes the handler should make…',
  approver_approve: 'Record the rationale for authorizing this plan…',
  approver_send_back_to_manager: 'Explain the points the manager needs to reconsider…',
  approver_send_back_to_pe: 'Explain what needs clarification or recommend the corrections needed before resubmission…',
})[activeAction.value] || 'Add context for the next reviewer…');
const isManagerAction = computed(() => ['manager_agree', 'manager_disagree'].includes(activeAction.value));
const handlerName = computed(() => {
  const handler = latestRecommendation.value?.handler;
  return handler ? `${handler.name || ''} ${handler.lastname || ''}`.trim() || handler.email || 'Assigned handler' : 'Assigned handler';
});
const nonRecommendActions = computed(() =>
  store.workflowActions.filter((a) => a !== 'handler_recommend'),
);
const latestRecommendation = computed(() => {
  const all = store.recommendations ?? [];
  if (!all.length) return null;
  return [...all].sort((a, b) => (b.cycle ?? 0) - (a.cycle ?? 0))[0];
});

const canSubmitHandler = computed(() =>
  ['APPROVE', 'SEND_BACK'].includes(handlerForm.recommendation)
    && handlerForm.comment.trim().length > 0
    && handlerForm.manager_user_id > 0,
);
const commentRequired = computed(() => COMMENT_REQUIRED.has(activeAction.value));

// AI-drafted send-back comment.
const drafting = ref(false);
const draftComment = async () => {
  if (!activeAction.value || drafting.value) return;
  drafting.value = true;
  const draft = await store.draftWorkflowComment(props.planUuid, activeAction.value);
  if (draft) modalComment.value = draft;
  drafting.value = false;
};

const actionLabel = (a) => ({
  manager_agree: 'Agree & forward to approver',
  manager_disagree: 'Disagree (send back to handler)',
  approver_approve: 'Approve plan',
  approver_send_back_to_manager: 'Send back to manager',
  approver_send_back_to_pe: 'Send plan back to PE',
})[a] ?? a;

const actionIcon = (a) => ({
  manager_agree: 'lucide:check-circle',
  manager_disagree: 'lucide:undo-2',
  approver_approve: 'lucide:check-circle',
  approver_send_back_to_manager: 'lucide:undo-2',
  approver_send_back_to_pe: 'lucide:send',
})[a] ?? 'lucide:circle';

const actionClass = (a) => ({
  manager_agree: 'btn-success',
  manager_disagree: 'btn-warning',
  approver_approve: 'btn-success',
  approver_send_back_to_manager: 'btn-warning',
  approver_send_back_to_pe: 'btn-error',
})[a] ?? 'btn-primary';

const actionDescription = (a) => ({
  manager_agree: 'You agree with the handler recommendation. Forwards the plan to the approver.',
  manager_disagree: 'You disagree with the handler recommendation. The plan goes back to the handler. A comment is required.',
  approver_approve: 'Approve the plan. The plan moves to AUTHORIZED and an invoice is generated for the PE.',
  approver_send_back_to_manager: 'Bounce back to the manager with your reservation. A comment is required.',
  approver_send_back_to_pe: 'Return the plan to the procurement entity to seek clarification or recommend corrections. The plan returns to draft for the entity to update and resubmit. Your comment is required and will be visible to the entity.',
})[a] ?? '';

const formatStatus = (s) => {
  if (!s) return '—';
  return s.split('_').map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join(' ');
};

const openPanel = async () => {
  handlerError.value = '';
  document.getElementById('admin_action_panel_modal').showModal();
  // Pre-load the relevant candidate list so the dropdown is populated
  // immediately once the user makes a choice.
  if (canHandlerRecommend.value && managerCandidates.value.length === 0) {
    await loadCandidates('manager');
  }
};
const closePanel = () => document.getElementById('admin_action_panel_modal').close();

const submitHandlerRecommend = async () => {
  if (!canSubmitHandler.value) return;
  handlerError.value = '';
  saving.value = true;
  try {
    const ok = await store.runTransition(props.planUuid, 'handler_recommend', handlerForm.comment, {
      recommendation: handlerForm.recommendation,
      manager_user_id: handlerForm.manager_user_id,
    });
    if (!ok) {
      handlerError.value = store.transitionError || 'Failed to submit recommendation.';
      return;
    }
    handlerForm.recommendation = '';
    handlerForm.comment = '';
    handlerForm.manager_user_id = 0;
    closePanel();
  } catch (error) {
    handlerError.value = error?.data?.message || 'Unable to complete the request. Please try again.';
  } finally {
    saving.value = false;
  }
};

const openAction = async (action) => {
  classDecision.value = 'MAINTAIN';
  approvedClassId.value = 0;
  classesError.value = '';
  activeAction.value = action;
  modalComment.value = '';
  modalApproverId.value = 0;
  modalError.value = '';
  document.getElementById('admin_action_modal').showModal();
  if (action === 'manager_agree' && approverCandidates.value.length === 0) {
    await loadCandidates('approver');
  }
};

const closeAction = () => {
  document.getElementById('admin_action_modal').close();
  activeAction.value = null;
};

const confirm = async () => {
  modalError.value = '';
  if (commentRequired.value && modalComment.value.trim() === '') {
    modalError.value = 'A comment is required for this action.';
    return;
  }
  if (activeAction.value === 'manager_agree' && modalApproverId.value <= 0) {
    modalError.value = 'Pick the approver to forward this to.';
    return;
  }
  const extra = activeAction.value === 'manager_agree'
    ? { approver_user_id: modalApproverId.value }
    : {};
  if (activeAction.value === 'approver_approve' && classDecision.value === 'CHANGE') {
    if (loadingClasses.value || classesError.value || !procurementClasses.value.some(entry => Number(entry.id) === approvedClassId.value)) {
      modalError.value = 'Select an available procurement class before approving.';
      return;
    }
    extra.procurementclass_id = approvedClassId.value;
  }
  saving.value = true;
  try {
    const ok = await store.runTransition(
      props.planUuid,
      activeAction.value,
      modalComment.value || null,
      extra,
    );
    if (ok) {
      closeAction();
      closePanel();
    } else {
      modalError.value = store.transitionError || 'Failed to perform action.';
    }
  } catch (error) {
    modalError.value = error?.data?.message || 'Unable to complete the request. Please try again.';
  } finally {
    saving.value = false;
  }
};
</script>
