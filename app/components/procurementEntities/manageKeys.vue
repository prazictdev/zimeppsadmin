<template>
  <div class="inline-flex">
    <button class="btn btn-ghost btn-xs" :title="`Manage encryption keys for ${company.name}`" @click="openModal">
      <Icon name="lucide:key-round" />
      <span class="hidden md:inline">Keys</span>
    </button>

    <dialog :id="dialogId" class="modal">
      <div class="modal-box h-screen max-h-none w-screen max-w-none rounded-none">
        <div class="flex items-center justify-between border-b border-base-200 pb-2">
          <div>
            <h3 class="text-lg font-bold">Encryption keys — {{ company.name }}</h3>
            <p class="text-xs text-base-content/60">
              Bidders use the active public key to seal bid envelopes for this PE.
              Rotation auto-retires the previous active key.
            </p>
          </div>
          <button class="btn btn-ghost btn-circle" @click="closeModal">
            <Icon name="lucide:x" />
          </button>
        </div>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div class="text-sm">
            <span v-if="active" class="badge badge-success badge-sm gap-1">
              <Icon name="lucide:check-circle" class="h-3 w-3" />
              Active key fingerprint <span class="font-mono ml-1">{{ active.fingerprint }}</span>
            </span>
            <span v-else class="badge badge-warning badge-sm">No active key</span>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary btn-sm" :disabled="store.acting" @click="confirmGenerate">
              <Icon :name="active ? 'lucide:refresh-cw' : 'lucide:plus'" />
              {{ active ? 'Rotate keypair' : 'Generate keypair' }}
            </button>
          </div>
        </div>

        <div v-if="store.isLoading(company.uuid)" class="flex justify-center py-10">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <div v-else class="mt-4 overflow-x-auto">
          <table class="table table-sm w-full">
            <thead>
              <tr class="text-left">
                <th>Status</th>
                <th>Fingerprint</th>
                <th>Public key (base64)</th>
                <th>Generated</th>
                <th>Retired</th>
                <th>Master ver</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!keys.length">
                <td colspan="7" class="text-center text-base-content/50 py-6">
                  No keys configured. Click <em>Generate keypair</em> to start.
                </td>
              </tr>
              <tr v-for="k in keys" :key="k.id">
                <td>
                  <span :class="['badge badge-sm', statusBadge(k.status)]">{{ k.status }}</span>
                </td>
                <td class="font-mono text-xs">{{ k.fingerprint }}</td>
                <td class="font-mono text-xs max-w-xs">
                  <div class="flex items-center gap-1">
                    <span class="truncate" :title="k.public_key">{{ k.public_key.slice(0, 20) }}...</span>
                    <button class="btn btn-ghost btn-xs" :title="'Copy full base64'" @click="copyToClipboard(k.public_key)">
                      <Icon name="lucide:copy" class="h-3 w-3" />
                    </button>
                  </div>
                </td>
                <td class="text-xs">{{ formatDate(k.generated_at) }}</td>
                <td class="text-xs">{{ formatDate(k.retired_at) }}</td>
                <td class="text-xs text-center">v{{ k.master_key_version }}</td>
                <td class="text-right">
                  <button
                    v-if="k.status === 'ACTIVE'"
                    class="btn btn-error btn-xs"
                    @click="confirmCompromise(k)"
                  >
                    <Icon name="lucide:shield-alert" />
                    Compromise
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="modal-action">
          <button class="btn" type="button" @click="closeModal">Close</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  company: { type: Object, required: true },
});

const store = usePeEncryptionKeyStore();
const dialogId = computed(() => `pe_keys_modal_${props.company.id}`);
const keys = computed(() => store.itemsFor(props.company.uuid));
const active = computed(() => keys.value.find((k) => k.status === 'ACTIVE') ?? null);

const openModal = async () => {
  document.getElementById(dialogId.value).showModal();
  await store.fetchFor(props.company.uuid);
};
const closeModal = () => document.getElementById(dialogId.value).close();

const confirmGenerate = async () => {
  const verb = active.value ? 'rotate' : 'generate';
  const msg = active.value
    ? 'Rotating will retire the current active key. Bidders will get the new public key on their next fetch. Continue?'
    : 'Generate a new encryption keypair for this PE?';
  if (!window.confirm(msg)) return;
  const notes = window.prompt('Optional notes (e.g. "Annual rotation"):', '');
  await store.generateFor(props.company.uuid, { notes: notes || null });
};

const confirmCompromise = async (k) => {
  const reason = window.prompt(`Mark key ${k.fingerprint} as COMPROMISED. Reason (required, ≥10 chars):`, '');
  if (!reason || reason.trim().length < 10) {
    if (reason !== null) window.alert('Reason must be at least 10 characters.');
    return;
  }
  await store.compromiseKey(props.company.uuid, k.id, { notes: reason });
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) { /* ignore */ }
};

const formatDate = (v) => (v ? new Date(v).toLocaleString() : '—');
const statusBadge = (s) => ({
  ACTIVE: 'badge-success',
  RETIRED: 'badge-ghost',
  COMPROMISED: 'badge-error',
})[s] ?? 'badge-ghost';
</script>
