<template>
  <div class="space-y-5">
    <section class="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div class="flex flex-col gap-6 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div class="flex min-w-0 items-start gap-4">
          <div class="grid size-12 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
            <Icon name="lucide:layers-3" class="size-6" />
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="truncate text-2xl font-semibold tracking-tight">
                {{ klass?.name ?? 'Procurement class' }}
              </h1>
              <span
                :class="[
                  'badge badge-sm font-medium',
                  klass?.status === 'ACTIVE' ? 'badge-success badge-outline' : 'badge-ghost',
                ]"
              >
                {{ klass?.status ?? 'Loading' }}
              </span>
            </div>
            <p class="mt-1 max-w-2xl text-sm leading-6 text-base-content/60">
              Manage method-specific limits and the fees applicable to this procurement class.
            </p>
          </div>
        </div>

        <dl class="grid grid-cols-3 divide-x divide-base-200 rounded-xl border border-base-200 bg-base-200/20">
          <div v-for="stat in summary" :key="stat.label" class="min-w-24 px-4 py-3 text-center">
            <dt class="text-xs font-medium uppercase tracking-wide text-base-content/50">{{ stat.label }}</dt>
            <dd class="mt-1 text-xl font-semibold tabular-nums">{{ stat.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="flex gap-1 border-t border-base-200 px-5 pt-2 lg:px-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="[
            'flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
            activeSection === tab.value
              ? 'border-slate-900 text-base-content'
              : 'border-transparent text-base-content/55 hover:text-base-content',
          ]"
          @click="activeSection = tab.value"
        >
          <Icon :name="tab.icon" class="size-4" />
          {{ tab.label }}
          <span class="badge badge-ghost badge-sm">{{ tab.count }}</span>
        </button>
      </div>
    </section>

    <section v-if="activeSection === 'thresholds'" class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold">Thresholds by procurement method</h2>
          <p class="mt-1 text-sm text-base-content/55">
            Expand a method to review its limits across procurement groups.
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <label class="input input-bordered input-sm flex min-w-64 items-center gap-2 bg-base-100">
            <Icon name="lucide:search" class="size-4 text-base-content/45" />
            <input v-model.trim="thresholdSearch" type="search" class="grow" placeholder="Search methods or groups" />
          </label>
          <ProcurementclassesThresholdAdd
            v-if="canAdd && klass?.status === 'ACTIVE'"
            :class-id="classId"
          />
        </div>
      </div>

      <div v-if="store.thresholdsLoading" class="grid min-h-52 place-items-center rounded-2xl border border-base-200 bg-base-100">
        <span class="loading loading-spinner loading-md"></span>
      </div>

      <div v-else-if="methodGroups.length" class="space-y-3">
        <details
          v-for="group in methodGroups"
          :key="group.id"
          open
          class="group overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm"
        >
          <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden">
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                <Icon name="lucide:workflow" class="size-4" />
              </span>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate font-semibold">{{ group.name }}</h3>
                  <span v-if="group.code" class="badge badge-ghost badge-sm font-mono">{{ group.code }}</span>
                </div>
                <p class="mt-0.5 text-xs text-base-content/50">
                  {{ group.items.length }} threshold{{ group.items.length === 1 ? '' : 's' }} configured
                </p>
              </div>
            </div>
            <Icon name="lucide:chevron-down" class="size-5 shrink-0 text-base-content/45 transition-transform group-open:rotate-180" />
          </summary>

          <div class="overflow-x-auto border-t border-base-200">
            <table class="table">
              <thead class="bg-base-200/30 text-xs uppercase tracking-wide text-base-content/50">
                <tr>
                  <th>Procurement group</th>
                  <th>Currency</th>
                  <th class="text-right">Threshold amount</th>
                  <th>Notes</th>
                  <th v-if="canEdit || canDelete" class="w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in group.items" :key="item.id" class="hover:bg-base-200/20">
                  <td>
                    <div class="font-medium">{{ item.procurementgroup?.name ?? 'Unassigned group' }}</div>
                    <div v-if="item.procurementgroup?.code" class="mt-0.5 text-xs text-base-content/45">
                      {{ item.procurementgroup.code }}
                    </div>
                  </td>
                  <td><span class="badge badge-outline badge-sm">{{ item.currency?.code || 'USD' }}</span></td>
                  <td class="whitespace-nowrap text-right font-mono font-semibold tabular-nums">
                    {{ formatAmount(item.threshold_amount) }}
                  </td>
                  <td class="max-w-md text-sm text-base-content/65">{{ item.notes || '—' }}</td>
                  <td v-if="canEdit || canDelete" class="text-right">
                    <div class="flex justify-end gap-1">
                      <ProcurementclassesThresholdEdit
                        v-if="canEdit && klass?.status === 'ACTIVE'"
                        :class-id="classId"
                        :item="item"
                      />
                      <ProcurementclassesThresholdDelete
                        v-if="canDelete && klass?.status === 'ACTIVE'"
                        :class-id="classId"
                        :item="item"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div v-else class="grid min-h-52 place-items-center rounded-2xl border border-dashed border-base-300 bg-base-100 p-8 text-center">
        <div>
          <span class="mx-auto grid size-11 place-items-center rounded-xl bg-base-200 text-base-content/50">
            <Icon :name="thresholdSearch ? 'lucide:search-x' : 'lucide:gauge'" class="size-5" />
          </span>
          <h3 class="mt-3 font-semibold">{{ thresholdSearch ? 'No matching thresholds' : 'No thresholds configured' }}</h3>
          <p class="mt-1 text-sm text-base-content/55">
            {{ thresholdSearch ? 'Try a different method, group, or currency.' : 'Add a threshold to begin configuring this class.' }}
          </p>
        </div>
      </div>
    </section>

    <section v-else class="overflow-hidden rounded-2xl border border-base-200 bg-base-100 shadow-sm">
      <div class="flex flex-col gap-3 border-b border-base-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold">Applicable fees</h2>
          <p class="mt-1 text-sm text-base-content/55">Charges linked to this procurement class.</p>
        </div>
        <ProcurementclassesFeeAdd
          v-if="canAdd && klass?.status === 'ACTIVE'"
          :class-id="classId"
        />
      </div>

      <div v-if="store.feesLoading" class="grid min-h-52 place-items-center">
        <span class="loading loading-spinner loading-md"></span>
      </div>
      <div v-else-if="store.fees.length" class="overflow-x-auto">
        <table class="table">
          <thead class="bg-base-200/30 text-xs uppercase tracking-wide text-base-content/50">
            <tr>
              <th>Inventory item</th>
              <th>GL code</th>
              <th>Currency</th>
              <th class="text-right">Amount</th>
              <th v-if="canEdit || canDelete" class="w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="fee in store.fees" :key="fee.id" class="hover:bg-base-200/20">
              <td class="font-medium">{{ fee.inventoryitem?.name ?? '—' }}</td>
              <td class="font-mono text-sm text-base-content/65">{{ fee.inventoryitem?.glcode || '—' }}</td>
              <td><span class="badge badge-outline badge-sm">{{ fee.currency?.code || '—' }}</span></td>
              <td class="whitespace-nowrap text-right font-mono font-semibold tabular-nums">{{ formatAmount(fee.amount) }}</td>
              <td v-if="canEdit || canDelete" class="text-right">
                <div class="flex justify-end gap-1">
                  <ProcurementclassesFeeEdit
                    v-if="canEdit && klass?.status === 'ACTIVE'"
                    :class-id="classId"
                    :item="fee"
                  />
                  <ProcurementclassesFeeDelete
                    v-if="canDelete && klass?.status === 'ACTIVE'"
                    :class-id="classId"
                    :item="fee"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="grid min-h-52 place-items-center p-8 text-center">
        <div>
          <span class="mx-auto grid size-11 place-items-center rounded-xl bg-base-200 text-base-content/50">
            <Icon name="lucide:receipt" class="size-5" />
          </span>
          <h3 class="mt-3 font-semibold">No fees configured</h3>
          <p class="mt-1 text-sm text-base-content/55">Add a fee to link an inventory charge to this class.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
defineProps({
  classId: { type: Number, required: true },
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
});

const store = useProcurementClassStore();
const { currentClass: klass } = storeToRefs(store);

const activeSection = ref('thresholds');
const thresholdSearch = ref('');

const groupedMethodsCount = computed(() => {
  const methodIds = new Set(
    store.thresholds.map((item) => item.procurementmethod_id ?? item.procurementmethod?.id ?? 'unassigned'),
  );
  return methodIds.size;
});

const summary = computed(() => [
  { label: 'Methods', value: groupedMethodsCount.value },
  { label: 'Thresholds', value: store.thresholds.length },
  { label: 'Fees', value: store.fees.length },
]);

const tabs = computed(() => [
  { value: 'thresholds', label: 'Thresholds', icon: 'lucide:gauge', count: store.thresholds.length },
  { value: 'fees', label: 'Fees', icon: 'lucide:receipt', count: store.fees.length },
]);

const methodGroups = computed(() => {
  const query = thresholdSearch.value.toLowerCase();
  const filtered = store.thresholds.filter((item) => {
    if (!query) return true;

    return [
      item.procurementmethod?.name,
      item.procurementmethod?.code,
      item.procurementgroup?.name,
      item.procurementgroup?.code,
      item.currency?.code,
      item.notes,
      item.threshold_amount,
    ].some((value) => String(value ?? '').toLowerCase().includes(query));
  });

  const groups = new Map();
  filtered.forEach((item) => {
    const id = item.procurementmethod_id ?? item.procurementmethod?.id ?? 'unassigned';
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: item.procurementmethod?.name ?? 'Unassigned method',
        code: item.procurementmethod?.code,
        items: [],
      });
    }
    groups.get(id).items.push(item);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) =>
        String(a.procurementgroup?.name ?? '').localeCompare(String(b.procurementgroup?.name ?? '')),
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '—';
  return amount.toLocaleString('en-ZW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
</script>
