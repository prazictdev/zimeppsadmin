<template>
  <div>
    <div class="card border border-base-200 mt-3">
      <div class="card-body">
        <div class="border-b border-base-200 pb-2">
          <div class="flex justify-between items-center">
            <div class="text-lg font-bold">Provinces</div>
            <div class="flex items-center gap-2">
              <ProvincesAdd />
            </div>
          </div>
        </div>
        <input
          type="text"
          class="input input-sm"
          placeholder="Search province"
          v-model="search"
          @input="handleSearch"
        />
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200 rounded-md">
              <th>#</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in provinces?.data || []"
              :key="item.id ?? index"
            >
              <td>{{ ((provinces.current_page - 1) * provinces.per_page) + index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td class="flex justify-end gap-2">
                <ProvincesEdit :province="item" />
                <ProvincesDelete :province="item" />
              </td>
            </tr>
            <tr v-if="!provinces || !(provinces.data?.length)">
              <td colspan="3" class="text-center text-sm text-base-content/60">
                No provinces found.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="provinces"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4"
        >
          <div class="text-sm text-base-content/60">
            <span v-if="provinces.total">
              Showing {{ provinces.from ?? 0 }}-{{ provinces.to ?? 0 }} of
              {{ provinces.total }}
            </span>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoPrev || loading }"
              :disabled="!canGoPrev || loading"
              @click="changePage(provinces.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-base-content/80">
              Page {{ provinces.current_page ?? 1 }} of
              {{ provinces.last_page ?? 1 }}
            </span>
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoNext || loading }"
              :disabled="!canGoNext || loading"
              @click="changePage(provinces.current_page + 1)"
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
  provinces: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  onPageChange: { type: Function, required: false },
});
const emit = defineEmits(['search-change']);
const search = ref('');

const canGoPrev = computed(() => (props.provinces?.current_page ?? 1) > 1);
const canGoNext = computed(
  () => (props.provinces?.current_page ?? 1) < (props.provinces?.last_page ?? 1),
);

const changePage = (page) => {
  if (props.onPageChange) props.onPageChange(page);
};

const handleSearch = () => {
  setTimeout(() => {
    emit('search-change', search.value);
  }, 500);
};
</script>
