<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Bank Access Tokens</span>
        <BankaccesstokensAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-2 mb-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search by bank..."
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Bank</th>
              <th>Token</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="5" class="text-center text-base-content/50">No bank access tokens found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.bank?.name ?? '—' }}</td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm">{{ maskToken(item.token) }}</span>
                  <button
                    class="btn btn-ghost btn-xs"
                    title="Copy token"
                    @click="copyToken(item.token)"
                  >
                    <Icon name="lucide:copy" class="h-3 w-3" />
                  </button>
                </div>
              </td>
              <td>
                <span
                  class="badge badge-sm"
                  :class="item.status === 'ACTIVE' ? 'badge-success' : 'badge-error'"
                >
                  {{ item.status ?? 'ACTIVE' }}
                </span>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <BankaccesstokensEdit v-if="canEdit" :item="item" />
                  <BankaccesstokensDelete v-if="canDelete" :item="item" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useBankAccessTokenStore();
const toast = useToast();
const search = ref('');

const filtered = computed(() =>
  store.items.filter((item) =>
    item.bank?.name?.toLowerCase().includes(search.value.toLowerCase()),
  ),
);

const maskToken = (token) => {
  if (!token) return '—';
  return `${token.substring(0, 8)}${'•'.repeat(24)}${token.substring(token.length - 8)}`;
};

const copyToken = async (token) => {
  try {
    await navigator.clipboard.writeText(token);
    toast.success({ title: 'Copied', message: 'Token copied to clipboard.', position: 'topRight', layout: 2 });
  } catch {
    toast.error({ title: 'Error', message: 'Failed to copy token.', position: 'topRight', layout: 2 });
  }
};
</script>
