<template>
  <div>
    <button class="btn btn-outline btn-sm gap-2" @click="openModal">
      <Icon name="lucide:layers" class="h-4 w-4" />
      <span class="hidden md:block">Methods</span>
      <span class="badge badge-sm" :class="item.methods?.length ? 'badge-primary' : 'badge-neutral'">
        {{ item.methods?.length ?? 0 }}
      </span>
    </button>

    <dialog :id="`manage_methods_modal_${item.id}`" class="modal">
      <div class="modal-box max-w-2xl">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold">Payment Methods</h3>
            <p class="text-sm text-base-content/50">Channel: <strong>{{ item.name }}</strong></p>
          </div>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('manage_methods_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>

        <!-- Add method button -->
        <div class="flex justify-end mb-3">
          <PaymentchannelsMethodAdd :channel-id="item.id" />
        </div>

        <!-- Methods table -->
        <div v-if="methodStore.loading" class="flex justify-center py-8">
          <span class="loading loading-spinner loading-md" />
        </div>

        <div v-else>
          <table v-if="methodStore.items.length" class="table table-sm w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Code</th>
                <th>Name</th>
                <th>URL</th>
                <th>Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(method, idx) in methodStore.items" :key="method.id">
                <td class="text-base-content/50 text-xs">{{ idx + 1 }}</td>
                <td>
                  <img v-if="method.logo" :src="method.logo" :alt="method.name" class="h-7 w-auto object-contain rounded" />
                  <span v-else class="text-xs text-base-content/30">—</span>
                </td>
                <td>
                  <code class="text-xs bg-base-200 px-1.5 py-0.5 rounded">{{ method.code }}</code>
                </td>
                <td class="font-medium">{{ method.name }}</td>
                <td>
                  <a v-if="method.url" :href="method.url" target="_blank" class="link link-primary text-xs truncate max-w-[120px] inline-block">{{ method.url }}</a>
                  <span v-else class="text-xs text-base-content/30">—</span>
                </td>
                <td>
                  <button
                    class="badge badge-sm border-0 cursor-pointer transition-opacity hover:opacity-70"
                    :class="method.is_active ? 'badge-success' : 'badge-neutral'"
                    :disabled="methodStore.togglingId === method.id"
                    @click="toggleMethod(method.id)"
                  >
                    <span v-if="methodStore.togglingId === method.id" class="loading loading-xs loading-spinner" />
                    <span v-else>{{ method.is_active ? 'Active' : 'Inactive' }}</span>
                  </button>
                </td>
                <td class="text-right">
                  <div class="flex justify-end gap-1.5">
                    <PaymentchannelsMethodEdit :item="method" :channel-id="item.id" />
                    <PaymentchannelsMethodDelete :item="method" :channel-id="item.id" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-else class="py-10 text-center text-base-content/40">
            <Icon name="lucide:inbox" class="h-8 w-8 mx-auto mb-2" />
            <p class="text-sm">No payment methods yet. Add one above.</p>
          </div>
        </div>

        <div class="modal-action">
          <button
            class="btn"
            :onclick="`document.getElementById('manage_methods_modal_${item.id}').close()`"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } })
const methodStore = usePaymentMethodStore()

const openModal = async () => {
  await methodStore.fetchByChannel(props.item.id)
  document.getElementById(`manage_methods_modal_${props.item.id}`).showModal()
}

const toggleMethod = (methodId) => methodStore.toggleActive(methodId, props.item.id)
</script>
