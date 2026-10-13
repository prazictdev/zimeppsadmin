<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-3">
        <span class="text-lg font-bold">Payment Channels</span>
        <PaymentchannelsAdd v-if="canAdd" />
      </div>

      <div v-if="store.loading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <div v-else>
        <!-- Search -->
        <div class="mt-2 mb-4">
          <input
            v-model="search"
            type="text"
            placeholder="Search channels..."
            class="input input-bordered w-full max-w-xs"
          />
        </div>

        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
              <th>Methods</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="6" class="text-center py-8 text-base-content/40">
                <Icon name="lucide:inbox" class="h-6 w-6 mx-auto mb-1" />
                No payment channels found.
              </td>
            </tr>

            <tr v-for="(channel, idx) in filtered" :key="channel.id">
              <td class="text-base-content/50 text-sm">{{ idx + 1 }}</td>
              <td>
                <code class="text-sm bg-base-200 px-2 py-0.5 rounded">{{ channel.code }}</code>
              </td>
              <td class="font-semibold">{{ channel.name }}</td>
              <td>
                <span class="badge badge-ghost badge-sm">
                  {{ channel.methods?.length ?? 0 }} method{{ (channel.methods?.length ?? 0) !== 1 ? 's' : '' }}
                </span>
              </td>
              <td>
                <button
                  class="badge badge-sm border-0 cursor-pointer transition-opacity hover:opacity-70"
                  :class="channel.is_active ? 'badge-success' : 'badge-neutral'"
                  :disabled="store.togglingId === channel.id"
                  @click="toggleActive(channel.id)"
                >
                  <span v-if="store.togglingId === channel.id" class="loading loading-xs loading-spinner" />
                  <span v-else>{{ channel.is_active ? 'Active' : 'Inactive' }}</span>
                </button>
              </td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <PaymentchannelsManageMethods :item="channel" />
                  <PaymentchannelsEdit v-if="canEdit" :item="channel" />
                  <PaymentchannelsDelete v-if="canDelete" :item="channel" />
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
})

const store = usePaymentChannelStore()
const search = ref('')

const filtered = computed(() =>
  store.items.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.value.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.value.toLowerCase()),
  ),
)

const toggleActive = (id) => store.toggleActive(id)
</script>
