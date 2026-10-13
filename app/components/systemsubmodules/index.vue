<template>
    <div>
      <div class="card border border-base-200 mt-3">
        <div class="card-body">
          <div class="border-b border-base-200 pb-2">
            <div class="flex justify-between items-center">
              <div class="text-lg font-bold">{{ systemmodule?.name || "" }} submodules</div>
              <div class="flex items-center gap-2">
                 
               <SystemsubmodulesAdd :module_id="systemmodule?.id" @refresh="handleRefresh" />
               </div>
            </div>
          </div>
          <input type="text" class="input input-sm" placeholder="Search module" v-model="search"   @input="handleSearch" />
          <table class="table table w-full">
            <thead >
              <tr class="bg-base-200 rounded-md">
                <th>Name</th>
                <th>Url</th>
                <th>Order</th>
                <th>Icon</th>
                <th>Status</th>
                <th>Permission</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(item, index) in systemmodule?.submodules || []"
                :key="item.id ?? index"
              >
                <td>{{ item.name }}</td>
                <td>{{ item.url }}</td>
                <td>{{ item.sort_order }}</td>
                <td>{{ item.icon }}</td>
                <td>
                  <span class="badge badge-success " v-if="item.status === 'ACTIVE'">Active</span>
                  <span class="badge badge-error" v-else>INACTIVE</span>
                </td>
                <td>{{ item.default_permission }}</td>
               
                <td class="flex justify-end">
                  <SystemsubmodulesEdit :systemsubmodule="item" @refresh="handleRefresh" />
                  <SystemsubmodulesDelete :systemsubmodule="item" @refresh="handleRefresh" />
                     <Permissions :submodule="item" />
                  </td>
              </tr>
              <tr v-if="!systemmodule || !(systemmodule.submodules?.length)">
                <td colspan="6" class="text-center text-sm text-base-content/60">
                  No system submodules found.
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
    systemmodule: {
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


  const emit =defineEmits(['search-change', 'refresh'])
  const search = ref('')
  const isSearching = ref(false)
 
  const handleSearch = () => {
      isSearching.value = true;
      // Debounce search
      setTimeout(() => {
          isSearching.value = false;
          emit('search-change', search.value);
      }, 500);
  }
  const handleRefresh = () => {
    emit('refresh');
  }
  </script>