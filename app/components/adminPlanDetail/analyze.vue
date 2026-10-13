<template>
  <div class="inline-flex">
    <button class="btn btn-outline btn-sm border-base-300" @click="openModal">
      <Icon name="lucide:scan-search" />
      <span class="hidden md:block">Analyze Plan</span>
    </button>

    <dialog id="admin_analyze_plan_modal" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">Plan Analysis</h3>
          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm" :disabled="store.analysisLoading" @click="rerun">
              <Icon name="lucide:refresh-cw" />
              <span class="hidden md:inline">Re-run</span>
            </button>
            <button class="btn btn-ghost btn-circle" onclick="admin_analyze_plan_modal.close()">
              <Icon name="lucide:x" />
            </button>
          </div>
        </div>

        <div v-if="store.analysisLoading" class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg"></span>
        </div>

        <div v-else-if="!report" class="py-16 text-center text-base-content/60">
          Run the analysis to see the report.
        </div>

        <div v-else class="mt-4 space-y-6">
          <div role="alert" :class="['alert', report.can_submit ? 'alert-success' : 'alert-warning']">
            <Icon :name="report.can_submit ? 'lucide:check-circle' : 'lucide:alert-triangle'" />
            <div>
              <p class="font-semibold">
                {{ report.can_submit ? 'Plan would pass submission checks.' : 'Plan has unresolved issues.' }}
              </p>
              <p v-if="!report.can_submit" class="text-sm">Read-only view — only the PE creator can resolve issues.</p>
            </div>
          </div>

          <!-- Tier 1 -->
          <section class="card border border-base-200">
            <div class="card-body">
              <div class="flex items-center justify-between border-b border-base-200 pb-2">
                <span class="text-lg font-bold">Tier 1 — Structural completeness</span>
                <span :class="['badge', report.tier1.passed ? 'badge-success' : 'badge-error']">
                  {{ report.tier1.passed ? 'Passed' : 'Failed' }}
                </span>
              </div>
              <ul class="mt-3 space-y-2">
                <li v-for="check in report.tier1.checks" :key="check.key" class="flex items-start gap-3">
                  <Icon
                    :name="check.status === 'pass' ? 'lucide:check-circle' : 'lucide:x-circle'"
                    :class="['mt-0.5 h-5 w-5', check.status === 'pass' ? 'text-success' : 'text-error']"
                  />
                  <div>
                    <p class="font-medium">{{ check.label }}</p>
                    <p class="text-sm text-base-content/70">{{ check.message }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <!-- Tier 2 -->
          <section v-if="report.tier2" class="card border border-base-200">
            <div class="card-body">
              <div class="flex items-center justify-between border-b border-base-200 pb-2">
                <span class="text-lg font-bold">Tier 2 — Item compliance</span>
                <span :class="['badge', tier2Passed ? 'badge-success' : 'badge-error']">
                  {{ tier2Passed ? 'Passed' : `${tier2TotalViolations} violation${tier2TotalViolations === 1 ? '' : 's'}` }}
                </span>
              </div>

              <div class="mt-3 space-y-4">
                <div v-for="rule in report.tier2.rules" :key="rule.key" class="rounded border border-base-200">
                  <div class="flex items-center justify-between border-b border-base-200 bg-base-200/40 px-3 py-2">
                    <div class="flex items-center gap-2 text-sm font-semibold">
                      <Icon
                        :name="rule.count === 0 ? 'lucide:check-circle' : 'lucide:x-circle'"
                        :class="['h-4 w-4', rule.count === 0 ? 'text-success' : 'text-error']"
                      />
                      {{ rule.label }}
                    </div>
                    <span :class="['badge badge-sm', rule.count === 0 ? 'badge-success' : 'badge-error']">
                      {{ rule.count }}
                    </span>
                  </div>
                  <table v-if="rule.count > 0" class="table table-sm w-full">
                    <thead>
                      <tr class="text-left">
                        <th>Ref</th>
                        <th>Description</th>
                        <th>Method</th>
                        <th>Schedule</th>
                        <th class="text-right">Threshold / Min</th>
                        <th class="text-right">Actual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(v, i) in rule.violations" :key="i">
                        <td class="font-mono text-xs">{{ v.reference_no || '—' }}</td>
                        <td class="max-w-xs">
                          <div class="truncate" :title="v.description">{{ v.description }}</div>
                          <p v-if="v.message" class="mt-0.5 flex items-start gap-1 text-xs text-error">
                            <Icon name="lucide:alert-circle" class="mt-0.5 h-3 w-3 shrink-0" />
                            <span>{{ v.message }}</span>
                          </p>
                        </td>
                        <td>
                          <span v-if="v.procurementmethod_name">
                            {{ v.procurementmethod_name }}<span v-if="v.procurementmethod_code" class="ml-1 text-xs text-base-content/60">({{ v.procurementmethod_code }})</span>
                          </span>
                          <span v-else class="text-base-content/50">—</span>
                        </td>
                        <td class="whitespace-nowrap text-xs">
                          <template v-if="v.bid_notice_publication_date || v.bid_closing_date">
                            {{ v.bid_notice_publication_date || '—' }} → {{ v.bid_closing_date || '—' }}
                          </template>
                          <span v-else class="text-base-content/50">—</span>
                        </td>
                        <td class="text-right font-mono">
                          <template v-if="v.threshold !== undefined">{{ formatAmount(v.threshold) }}</template>
                          <template v-else-if="v.minimum !== undefined">≥ {{ v.minimum }}</template>
                          <template v-else>—</template>
                        </td>
                        <td class="text-right font-mono">
                          <template v-if="typeof v.actual === 'number' && v.threshold !== undefined">{{ formatAmount(v.actual) }}</template>
                          <template v-else>{{ v.actual }}</template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else class="px-3 py-2 text-sm text-base-content/60">No violations.</p>
                </div>
              </div>
            </div>
          </section>

          <section v-else class="alert alert-info">
            <Icon name="lucide:info" />
            <span>Tier 1 must pass before Tier 2 checks run.</span>
          </section>

          <!-- AI Compliance Review (advisory) -->
          <section v-if="aiFeaturesVisible" class="card border border-base-200">
            <div class="card-body">
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-200 pb-2">
                <span class="flex items-center gap-2 text-lg font-bold">
                  <Icon name="lucide:sparkles" class="h-5 w-5 text-primary" />
                  AI Compliance Review
                </span>
                <div class="flex items-center gap-2">
                  <button
                    v-if="aiReport"
                    class="btn btn-ghost btn-sm gap-1.5"
                    title="Copy the AI review as text to paste into your recommendation comment"
                    @click="copyAiReview"
                  >
                    <Icon :name="copied ? 'lucide:check' : 'lucide:clipboard'" class="h-4 w-4" />
                    {{ copied ? 'Copied' : 'Copy for comment' }}
                  </button>
                  <button
                    class="btn btn-primary btn-sm"
                    :disabled="store.complianceLoading || !store.complianceLawReady"
                    @click="runCompliance"
                  >
                    <span v-if="store.complianceLoading" class="loading loading-spinner loading-xs" />
                    <Icon v-else name="lucide:scan-search" />
                    {{ aiReport ? 'Re-run AI review' : 'Run AI review' }}
                  </button>
                </div>
              </div>

              <div v-if="!store.complianceLawReady" role="alert" class="alert alert-warning mt-3 text-sm">
                <Icon name="lucide:alert-triangle" />
                <span>The procurement-law knowledge base is not indexed yet, so AI legal analysis is unavailable.</span>
              </div>

              <div v-else-if="store.complianceLoading" class="flex items-center justify-center gap-2 py-10 text-base-content/60">
                <span class="loading loading-spinner loading-md" />
                <span class="text-sm">Reviewing the plan against procurement law… this can take up to a minute.</span>
              </div>

              <div v-else-if="!aiReport" class="py-8 text-center text-sm text-base-content/60">
                Run the AI review for a law-grounded recommendation to approve or send back to the PE.
              </div>

              <div v-else class="mt-3 space-y-4">
                <div role="alert" :class="['alert', aiDecisionClass]">
                  <Icon :name="aiDecisionIcon" />
                  <div>
                    <p class="font-semibold">{{ aiDecisionLabel }}</p>
                    <p v-if="aiReport.decision_rationale" class="text-sm">{{ aiReport.decision_rationale }}</p>
                    <p class="mt-1 text-xs opacity-70">Advisory only — use the workflow actions to act on the plan.</p>
                  </div>
                </div>

                <p v-if="aiReport.summary" class="text-sm text-base-content/80">{{ aiReport.summary }}</p>

                <div v-if="aiReport.findings?.length" class="space-y-2">
                  <div v-for="(f, i) in aiReport.findings" :key="i" class="rounded-lg border border-base-200 p-3">
                    <div class="flex items-center gap-2">
                      <span :class="['badge badge-sm', severityBadge(f.severity)]">{{ f.severity }}</span>
                      <span v-if="f.area" class="text-xs font-semibold uppercase tracking-wide text-base-content/50">{{ f.area }}</span>
                    </div>
                    <p class="mt-1.5 text-sm font-medium">{{ f.finding }}</p>
                    <p v-if="f.recommendation" class="mt-1 flex items-start gap-1.5 text-sm text-base-content/70">
                      <Icon name="lucide:wrench" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{{ f.recommendation }}</span>
                    </p>
                    <p v-if="f.legal_citation" class="mt-1 flex items-center gap-1 text-xs text-base-content/50">
                      <Icon name="lucide:scale" class="h-3 w-3" />
                      {{ f.legal_citation }}
                    </p>
                    <div v-if="f.references?.length" class="mt-1.5 flex flex-wrap items-center gap-1">
                      <span class="text-xs text-base-content/50">Affected:</span>
                      <span v-for="(r, ri) in f.references" :key="ri" class="badge badge-outline badge-xs font-mono">{{ r }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="rounded-lg border border-success/30 bg-success/5 p-3 text-sm">
                  No legal compliance issues were flagged by the AI review.
                </div>

                <p v-if="aiReport.message" class="text-xs text-base-content/50">{{ aiReport.message }}</p>
              </div>
            </div>
          </section>

          <!-- Ask the AI (chat) -->
          <section v-if="aiFeaturesVisible" class="card border border-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 border-b border-base-200 pb-2">
                <Icon name="lucide:message-circle" class="h-5 w-5 text-primary" />
                <span class="text-lg font-bold">Ask the AI</span>
                <span class="text-xs text-base-content/50">about this plan &amp; its issues</span>
              </div>

              <div ref="chatScroll" class="mt-3 max-h-80 space-y-3 overflow-y-auto">
                <div v-if="!store.chatMessages.length && !store.chatLoading" class="py-6 text-center text-sm text-base-content/50">
                  Ask a question about the plan or the issues raised above.
                </div>
                <div
                  v-for="m in store.chatMessages"
                  :key="m.id"
                  class="flex"
                  :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm"
                    :class="m.role === 'user' ? 'bg-primary text-primary-content' : 'bg-base-200'"
                  >
                    {{ m.content }}
                  </div>
                </div>
                <div v-if="store.chatSending" class="flex justify-start">
                  <div class="flex items-center gap-2 rounded-2xl bg-base-200 px-3 py-2 text-sm text-base-content/60">
                    <span class="loading loading-dots loading-sm" /> AI is typing…
                  </div>
                </div>
              </div>

              <div v-if="!store.chatMessages.length" class="mt-2 flex flex-wrap gap-1.5">
                <button
                  v-for="s in chatSuggestions"
                  :key="s"
                  type="button"
                  class="badge badge-outline badge-sm cursor-pointer"
                  @click="chatInput = s"
                >
                  {{ s }}
                </button>
              </div>

              <div class="mt-3 flex items-end gap-2">
                <textarea
                  v-model="chatInput"
                  rows="1"
                  placeholder="Ask about the plan or an issue…"
                  class="textarea textarea-bordered min-h-10 flex-1 resize-none"
                  @keydown.enter.exact.prevent="sendChat"
                />
                <button class="btn btn-primary btn-sm" :disabled="store.chatSending || !chatInput.trim()" @click="sendChat">
                  <Icon name="lucide:send" class="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div class="modal-action">
          <button class="btn" type="button" onclick="admin_analyze_plan_modal.close()">Close</button>
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
const report = computed(() => store.analysisReport);
const aiFeaturesVisible = false;

const tier2TotalViolations = computed(() =>
  (report.value?.tier2?.rules ?? []).reduce((sum, r) => sum + (r.count ?? 0), 0),
);
const tier2Passed = computed(() => tier2TotalViolations.value === 0);

const openModal = async () => {
  document.getElementById('admin_analyze_plan_modal').showModal();
  if (!store.analysisReport) await store.runAnalysis(props.planUuid);
  if (aiFeaturesVisible) {
    store.fetchComplianceAnalysis(props.planUuid);
    store.fetchComplianceChat(props.planUuid);
  }
};

// ─── Ask the AI (chat) ────────────────────────────────────────────────────
const chatInput = ref('');
const chatScroll = ref(null);
const chatSuggestions = [
  'Explain the issues raised',
  'Should I approve or send this back?',
  'Which rows breach a threshold?',
];

const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatScroll.value) chatScroll.value.scrollTop = chatScroll.value.scrollHeight;
  });
};

watch(() => store.chatMessages.length, scrollChatToBottom);

const sendChat = async () => {
  const text = chatInput.value.trim();
  if (!text || store.chatSending) return;
  chatInput.value = '';
  await store.sendComplianceChatMessage(props.planUuid, text);
};

const rerun = () => store.runAnalysis(props.planUuid);

// ─── AI compliance review ─────────────────────────────────────────────────
const aiReport = computed(() => store.complianceReport?.ai ?? null);

const runCompliance = () => store.runComplianceAnalysis(props.planUuid);

// Format the AI review as plain text and copy it so the admin can paste it
// into a recommendation / send-back comment.
const copied = ref(false);

const buildAiText = () => {
  const r = aiReport.value;
  if (!r) return '';
  const lines = [`AI Compliance Review — ${aiDecisionLabel.value}`];
  if (r.decision_rationale) lines.push(r.decision_rationale);
  if (r.summary) lines.push('', `Summary: ${r.summary}`);
  if (r.findings?.length) {
    lines.push('', 'Findings:');
    r.findings.forEach((f, i) => {
      const sev = String(f.severity || '').toUpperCase();
      lines.push(`${i + 1}. [${sev}] ${f.area ? `${f.area}: ` : ''}${f.finding}`);
      if (f.recommendation) lines.push(`   Recommendation: ${f.recommendation}`);
      if (f.legal_citation) lines.push(`   Legal basis: ${f.legal_citation}`);
      if (f.references?.length) lines.push(`   Affected: ${f.references.join(', ')}`);
    });
  }
  return lines.join('\n');
};

const copyAiReview = async () => {
  const text = buildAiText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for browsers/contexts without the async clipboard API.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copied.value = true;
  setTimeout(() => { copied.value = false; }, 2000);
};

const severityBadge = (s) => ({
  critical: 'badge-error',
  warning: 'badge-warning',
  info: 'badge-info',
})[s] ?? 'badge-ghost';

const aiDecisionLabel = computed(() => {
  const d = aiReport.value?.decision;
  if (d === 'APPROVE') return 'AI recommends: Approve';
  if (d === 'SEND_BACK_TO_PE') return 'AI recommends: Send back to PE';
  return 'AI review complete';
});
const aiDecisionClass = computed(() => {
  const d = aiReport.value?.decision;
  if (d === 'APPROVE') return 'alert-success';
  if (d === 'SEND_BACK_TO_PE') return 'alert-warning';
  return 'alert-info';
});
const aiDecisionIcon = computed(() => {
  const d = aiReport.value?.decision;
  if (d === 'APPROVE') return 'lucide:check-circle';
  if (d === 'SEND_BACK_TO_PE') return 'lucide:corner-up-left';
  return 'lucide:info';
});

const formatAmount = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
