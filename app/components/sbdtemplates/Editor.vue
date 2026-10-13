<template>
  <div class="flex min-h-0 flex-1 flex-col gap-2">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1 rounded-lg border border-base-200 bg-base-100 p-1">
      <span class="px-2 text-xs text-base-content/50">HTML template</span>
      <span class="grow"></span>
      <button type="button" class="btn btn-ghost btn-xs" title="Insert a data token" @click="openTokens">
        <Icon name="lucide:braces" class="h-4 w-4" /> Tokens
      </button>
      <button type="button" class="btn btn-ghost btn-xs" @click="emit('load-default')">
        <Icon name="lucide:wand-2" class="h-4 w-4" /> Load default
      </button>
    </div>

    <!-- Editor (raw HTML) -->
    <textarea
      ref="textareaRef"
      :value="modelValue"
      class="min-h-0 flex-1 resize-none overflow-auto rounded-lg border border-base-200 bg-white p-4 font-mono text-xs text-black focus:outline-none"
      placeholder="<h2>Bidding Procedures</h2> ... use {{token}} placeholders"
      @input="emit('update:modelValue', $event.target.value)"
    />

    <!-- Tokens dialog (smaller) -->
    <dialog :id="tokenDialogId" class="modal">
      <div class="modal-box">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold">Available tokens</h3>
          <button type="button" class="btn btn-ghost btn-circle btn-sm" @click="closeTokens">
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="mt-1 text-xs text-base-content/60">Click a token to insert it at the cursor.</p>
        <div class="mt-2 max-h-96 space-y-1 overflow-auto">
          <button
            v-for="t in bracedTokens"
            :key="t.token"
            type="button"
            class="flex w-full items-center justify-between gap-3 rounded px-2 py-1 text-left hover:bg-base-200"
            @click="insertToken(t.token)"
          >
            <code class="text-primary">{{ t.braced }}</code>
            <span class="text-xs text-base-content/60">{{ t.description }}</span>
          </button>
          <p v-if="!tokens.length" class="text-sm text-base-content/50">No tokens available.</p>
        </div>
        <div class="modal-action">
          <button type="button" class="btn" @click="closeTokens">Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  tokens: { type: Array, default: () => [] },
  dialogId: { type: String, required: true },
});
const emit = defineEmits(['update:modelValue', 'load-default']);

const textareaRef = ref(null);
const tokenDialogId = computed(() => `tokens_dialog_${props.dialogId}`);
const braceToken = (t) => `{{${t}}}`;

// Precompute the braced display string so the template never contains a
// function-call expression (Tailwind v4's candidate scanner misreads it).
const bracedTokens = computed(() => props.tokens.map((t) => ({ ...t, braced: braceToken(t.token) })));

const setContent = (html) => emit('update:modelValue', html ?? '');
defineExpose({ setContent });

const insertToken = (token) => {
  const text = braceToken(token);
  const ta = textareaRef.value;
  if (ta && typeof ta.selectionStart === 'number') {
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = props.modelValue ?? '';
    emit('update:modelValue', val.slice(0, start) + text + val.slice(end));
    nextTick(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    });
  } else {
    emit('update:modelValue', (props.modelValue ?? '') + text);
  }
  closeTokens();
};

const openTokens = () => document.getElementById(tokenDialogId.value)?.showModal();
const closeTokens = () => document.getElementById(tokenDialogId.value)?.close();
</script>
