<template>
  <div>
    <div class="card border border-base-200 mt-3">
      <div class="card-body">
        <div class="border-b border-base-200 pb-2">
          <div class="flex justify-between items-center">
            <div class="text-lg font-bold">System roles</div>
            <div class="flex items-center gap-2">
              <SystemrolesAdd />
            </div>
          </div>
        </div>
        <input
          type="text"
          class="input input-sm"
          placeholder="Search role"
          v-model="search"
          @input="handleSearch"
        />
        <table class="table table w-full">
          <thead>
            <tr class="bg-base-200 rounded-md">
              <th>Name</th>
              <th>Guard name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in systemroles?.data || []"
              :key="item.id ?? index"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.guard_name }}</td>
              <td class="flex justify-end">
                <SystemrolesEdit :systemrole="item" />
                <SystemrolesDelete :systemrole="item" />
              </td>
            </tr>
            <tr v-if="!systemroles || !(systemroles.data?.length)">
              <td colspan="3" class="text-center text-sm text-base-content/60">
                No system roles found.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="systemroles"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4"
        >
          <div class="text-sm text-base-content/60">
            <span v-if="systemroles.total">
              Showing {{ systemroles.from ?? 0 }}-{{ systemroles.to ?? 0 }} of
              {{ systemroles.total }}
            </span>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoPrev || loading }"
              :disabled="!canGoPrev || loading"
              @click="changePage(systemroles.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-base-content/80">
              Page {{ systemroles.current_page ?? 1 }} of
              {{ systemroles.last_page ?? 1 }}
            </span>
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoNext || loading }"
              :disabled="!canGoNext || loading"
              @click="changePage(systemroles.current_page + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  systemroles: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  onPageChange: { type: Function, required: false },
});
const emit = defineEmits(['search-change']);
const search = ref('');
const isSearching = ref(false);

const canGoPrev = computed(
  () => (props.systemroles?.current_page ?? 1) > 1,
);
const canGoNext = computed(
  () =>
    (props.systemroles?.current_page ?? 1) < (props.systemroles?.last_page ?? 1),
);

const changePage = (page) => {
  if (props.onPageChange) props.onPageChange(page);
};
const handleSearch = () => {
  isSearching.value = true;
  setTimeout(() => {
    isSearching.value = false;
    emit('search-change', search.value);
  }, 500);
};
</script>
