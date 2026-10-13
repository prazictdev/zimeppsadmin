<template>
  <div>
    <div class="card border border-base-200 mt-3">
      <div class="card-header bg-primary text-white rounded-t-md p-5">
        <div class="flex justify-between items-center">
          <div class="text-lg font-bold">Account types</div>
          <div class="flex items-center gap-2">
              
             <AccounttypesAdd />
             </div>
          </div>
        </div>
      <div class="card-body">
       
        <input type="text" class="input input-sm" placeholder="Search account type" v-model="search"   @input="handleSearch" />
        <table class="table table w-full">
          <thead >
            <tr class="bg-base-200 rounded-md">
              <th>Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in accounttypes?.data || []"
              :key="item.id ?? index"
            >
              <td>{{ item.name }}</td>
              <td>
                <span class="badge badge-success" v-if="item.status === 'ACTIVE'">Active</span>
                <span class="badge badge-error" v-else>Inactive</span>
              </td>
              <td class="flex justify-end">
                <AccounttypesEdit :accounttype="item" />
                <AccounttypesDelete :accounttype="item" />
                <AccounttypesShow :accounttype="item" />
              </td>
            </tr>
            <tr v-if="!accounttypes || !(accounttypes.data?.length)">
              <td colspan="2" class="text-center text-sm text-base-content/60">
                No account types found.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="accounttypes"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4"
        >
          <div class="text-sm text-base-content/60">
            <span v-if="accounttypes.total">
              Showing
              {{ accounttypes.from ?? 0 }}-{{ accounttypes.to ?? 0 }}
              of
              {{ accounttypes.total }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-2">
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoPrev || loading }"
              :disabled="!canGoPrev || loading"
              @click="changePage(accounttypes.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-base-content/80">
              Page
              {{ accounttypes.current_page ?? 1 }}
              of
              {{ accounttypes.last_page ?? 1 }}
            </span>
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoNext || loading }"
              :disabled="!canGoNext || loading"
              @click="changePage(accounttypes.current_page + 1)"
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
  accounttypes: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  onPageChange: {
    type: Function,
    required: false,
  },
});
const emit =defineEmits(['search-change'])
const search = ref('')
const isSearching = ref(false)

const canGoPrev = computed(
  () => (props.accounttypes?.current_page ?? 1) > 1,
);
const canGoNext = computed(
  () =>
    (props.accounttypes?.current_page ?? 1) <
    (props.accounttypes?.last_page ?? 1),
);

const changePage = (page) => {
  if (!props.onPageChange) return;
  props.onPageChange(page);
};
const handleSearch = () => {
    isSearching.value = true;
    // Debounce search
    setTimeout(() => {
        isSearching.value = false;
        emit('search-change', search.value);
    }, 500);
}
</script>
<style scoped>
</style>