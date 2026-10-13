<template>
  <div>
    <div class="card border border-base-200 mt-3">
      <div class="card-body">
        <div class="border-b border-base-200 pb-2">
          <div class="flex justify-between items-center">
            <div class="text-lg font-bold">Districts</div>
            <div class="flex items-center gap-2">
              <DistrictsAdd :provinces="provinces" />
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            class="input input-sm flex-1"
            placeholder="Search district"
            v-model="search"
            @input="handleSearch"
          />
          <select
            class="select select-sm"
            v-model="selectedProvinceId"
            @change="handleProvinceFilter"
          >
            <option value="">All provinces</option>
            <option
              v-for="prov in provinces"
              :key="prov.id"
              :value="prov.id"
            >
              {{ prov.name }}
            </option>
          </select>
        </div>
        <table class="table w-full">
          <thead>
            <tr class="bg-base-200 rounded-md">
              <th>#</th>
              <th>Name</th>
              <th>Province</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in districts?.data || []"
              :key="item.id ?? index"
            >
              <td>{{ ((districts.current_page - 1) * districts.per_page) + index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.province?.name ?? '-' }}</td>
              <td class="flex justify-end gap-2">
                <DistrictsEdit :district="item" :provinces="provinces" />
                <DistrictsDelete :district="item" />
              </td>
            </tr>
            <tr v-if="!districts || !(districts.data?.length)">
              <td colspan="4" class="text-center text-sm text-base-content/60">
                No districts found.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="districts"
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4"
        >
          <div class="text-sm text-base-content/60">
            <span v-if="districts.total">
              Showing {{ districts.from ?? 0 }}-{{ districts.to ?? 0 }} of
              {{ districts.total }}
            </span>
          </div>
          <div class="flex items-center justify-end gap-2">
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoPrev || loading }"
              :disabled="!canGoPrev || loading"
              @click="changePage(districts.current_page - 1)"
            >
              Previous
            </button>
            <span class="text-sm text-base-content/80">
              Page {{ districts.current_page ?? 1 }} of
              {{ districts.last_page ?? 1 }}
            </span>
            <button
              class="btn btn-sm"
              :class="{ 'btn-disabled': !canGoNext || loading }"
              :disabled="!canGoNext || loading"
              @click="changePage(districts.current_page + 1)"
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
  districts: { type: Object, required: true },
  provinces: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  onPageChange: { type: Function, required: false },
});
const emit = defineEmits(['search-change', 'province-filter-change']);
const search = ref('');
const selectedProvinceId = ref('');

const canGoPrev = computed(() => (props.districts?.current_page ?? 1) > 1);
const canGoNext = computed(
  () => (props.districts?.current_page ?? 1) < (props.districts?.last_page ?? 1),
);

const changePage = (page) => {
  if (props.onPageChange) props.onPageChange(page);
};

const handleSearch = () => {
  setTimeout(() => {
    emit('search-change', search.value);
  }, 500);
};

const handleProvinceFilter = () => {
  emit('province-filter-change', selectedProvinceId.value);
};
</script>
