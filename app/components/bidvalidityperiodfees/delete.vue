<template>
  <div>
    <button class="btn btn-error btn-sm" @click="openModal">
      <Icon name="lucide:trash-2" />
      <span class="hidden md:block">Delete</span>
    </button>
    <dialog :id="`delete_bidvalidityperiodfee_modal_${item.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Delete Fee</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('delete_bidvalidityperiodfee_modal_${item.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <p class="py-4">
          Delete the
          <span class="font-bold">{{ item.bid_validity_period }}-day</span>
          <span class="font-bold"> {{ localityLabel(item.locality) }}</span>
          band
          <span class="font-bold">({{ bandLabel }} → {{ feeLabel }})</span>?
          This cannot be undone.
        </p>
        <div class="modal-action">
          <button
            class="btn"
            type="button"
            :onclick="`document.getElementById('delete_bidvalidityperiodfee_modal_${item.id}').close()`"
          >Close</button>
          <button class="btn btn-error" :disabled="submitting" @click="handleDelete">
            <span v-if="submitting">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({ item: { type: Object, required: true } });
const store = useBidValidityPeriodFeeStore();
const submitting = ref(false);

const localityLabel = (l) => ({ local: 'Local', foreign: 'Foreign', all: 'All' }[l] ?? l);

const money = (v) => Number(v ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const bandLabel = computed(() => {
  const code = props.item.currency?.code ?? '';
  const min = money(props.item.min_amount);
  return props.item.max_amount == null
    ? `${code} ${min}+`.trim()
    : `${code} ${min} – ${money(props.item.max_amount)}`.trim();
});

const feeLabel = computed(() => {
  if (props.item.fee != null) return `${props.item.currency?.code ?? ''} ${money(props.item.fee)}`.trim();
  if (props.item.fee_percentage != null) return `${Number(props.item.fee_percentage)}%`;
  return '—';
});

const openModal = () =>
  document.getElementById(`delete_bidvalidityperiodfee_modal_${props.item.id}`).showModal();

const handleDelete = async () => {
  try {
    submitting.value = true;
    const ok = await store.remove(props.item.id);
    if (ok) document.getElementById(`delete_bidvalidityperiodfee_modal_${props.item.id}`).close();
  } finally {
    submitting.value = false;
  }
};
</script>
