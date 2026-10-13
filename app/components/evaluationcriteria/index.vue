<template>
  <div class="card mt-3 border border-base-200">
    <div class="card-body">
      <div class="flex items-center justify-between border-b border-base-200 pb-2">
        <span class="text-lg font-bold">Evaluation Criteria</span>
        <EvaluationcriteriaAdd v-if="canAdd" />
      </div>
      <div v-if="store.loading" class="flex justify-center py-10">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
      <div v-else>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search evaluation criteria..."
            class="input input-bordered w-full max-w-xs"
          />
        </div>
        <table class="table table-zebra mt-3 w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Code</th>
              <th>Name</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!filtered.length">
              <td colspan="4" class="text-center text-base-content/50">No evaluation criteria found.</td>
            </tr>
            <tr v-for="(item, i) in filtered" :key="item.id">
              <td>{{ i + 1 }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.name }}</td>
              <td class="text-right">
                <div class="flex justify-end gap-2">
                  <EvaluationcriteriaEdit v-if="canEdit" :item="item" />
                  <EvaluationcriteriaDelete v-if="canDelete" :item="item" />
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
const store = useEvaluationcriterionStore();
const search = ref('');

defineProps({
  canAdd: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
  canDelete: { type: Boolean, default: false },
  canAccess: { type: Boolean, default: false },
});

const filtered = computed(() =>
  store.items.filter((i) => {
    const q = search.value.toLowerCase();
    return (
      i.name?.toLowerCase().includes(q) ||
      i.code?.toLowerCase().includes(q)
    );
  }),
);
</script>
