<template>
    <div>
      <div class="card border border-base-200 mt-3">
        <div class="card-body">
          <div class="border-b border-base-200 pb-2">
            <div class="flex justify-between items-center">
              <div class="text-lg font-bold">System modules</div>
              <div class="flex items-center gap-2">
                 
               <SystemmodulesAdd />
               </div>
            </div>
          </div>
          <input type="text" class="input input-sm" placeholder="Search module" v-model="search"   @input="handleSearch" />
          <table class="table table w-full">
            <thead >
              <tr class="bg-base-200 rounded-md">
                <th>Name</th>
                <th>Order</th>
                <th>Icon</th>
                <th>Status</th>
                <th>Permission</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in systemmodules?.data || []"
                :key="item.id ?? index"
              >
                <td>{{ item.name }}</td>
                <td>{{ item.sort_order }}</td>
                <td>{{ item.icon }}</td>
                <td>
                  <span class="badge badge-success " v-if="item.status === 'ACTIVE'">Active</span>
                  <span class="badge badge-error" v-else>INACTIVE</span>
                </td>
                <td>{{ item.default_permission }}</td>
               
                <td class="flex justify-end">
                  <SystemmodulesEdit  :systemmodule="item" />
                  <SystemmodulesDelete :systemmodule="item" />
                  <NuxtLink :to="`/systemsubmodules/${item.uuid}`" class="btn btn-sm ml-2 btn-primary">
                    <Icon name="lucide:eye" />
                    View
                  </NuxtLink>
                </td>
              </tr>
              <tr v-if="!systemmodules || !(systemmodules.data?.length)">
                <td colspan="6" class="text-center text-sm text-base-content/60">
                  No system modules found.
                </td>
              </tr>
            </tbody>
          </table>
  
          <div
            v-if="systemmodules"
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4"
          >
            <div class="text-sm text-base-content/60">
              <span v-if="systemmodules.total">
                Showing
                {{ systemmodules.from ?? 0 }}-{{ systemmodules.to ?? 0 }}
                of
                {{ systemmodules.total }}
              </span>
            </div>
  
            <div class="flex items-center justify-end gap-2">
              <button
                class="btn btn-sm"
                :class="{ 'btn-disabled': !canGoPrev || loading }"
                :disabled="!canGoPrev || loading"
                @click="changePage(systemmodules.current_page - 1)"
              >
                Previous
              </button>
              <span class="text-sm text-base-content/80">
                Page
                {{ systemmodules.current_page ?? 1 }}
                of
                {{ systemmodules.last_page ?? 1 }}
              </span>
              <button
                class="btn btn-sm"
                :class="{ 'btn-disabled': !canGoNext || loading }"
                :disabled="!canGoNext || loading"
                @click="changePage(systemmodules.current_page + 1)"
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
    systemmodules: {
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
    () => (props.systemmodules?.current_page ?? 1) > 1,
  );
  const canGoNext = computed(
    () =>
      (props.systemmodules?.current_page ?? 1) <
      (props.systemmodules?.last_page ?? 1),
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