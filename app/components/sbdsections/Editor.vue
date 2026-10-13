<template>
  <div class="space-y-3">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label class="fieldset">
        <span class="fieldset-legend">Section title</span>
        <input
          v-model="section.title"
          type="text"
          placeholder="e.g. Special Conditions of Contract"
          :class="['input input-bordered w-full', titleError ? 'input-error' : '']"
        />
        <label v-if="titleError" class="label">
          <span class="label-text-alt text-red-600">{{ titleError }}</span>
        </label>
      </label>
      <label class="fieldset">
        <span class="fieldset-legend">Section type</span>
        <select v-model="section.type" class="select select-bordered w-full">
          <option value="label_value">Label → value</option>
          <option value="table">Table</option>
          <option value="list">List</option>
        </select>
      </label>
    </div>

    <!-- label → value -->
    <div v-if="section.type === 'label_value'" class="space-y-2 rounded-lg border border-base-200 p-3">
      <div v-for="(field, fi) in section.fields" :key="fi" class="flex flex-wrap items-center gap-2">
        <input v-model="field.label" type="text" placeholder="Label" class="input input-bordered input-sm w-full sm:w-1/3" />
        <input v-model="field.value" type="text" placeholder="Value" class="input input-bordered input-sm w-full flex-1" />
        <button type="button" class="btn btn-ghost btn-xs text-error" @click="section.fields.splice(fi, 1)">
          <Icon name="lucide:x" class="h-3.5 w-3.5" />
        </button>
      </div>
      <button type="button" class="btn btn-ghost btn-xs" @click="section.fields.push({ label: '', value: '' })">
        <Icon name="lucide:plus" class="h-3.5 w-3.5" /> Add field
      </button>
    </div>

    <!-- table -->
    <div v-else-if="section.type === 'table'" class="space-y-2 overflow-x-auto rounded-lg border border-base-200 p-3">
      <table class="table table-xs w-auto">
        <thead>
          <tr>
            <th v-for="(col, ci) in section.columns" :key="ci">
              <div class="flex items-center gap-1">
                <input v-model="section.columns[ci]" placeholder="Column" class="input input-bordered input-xs w-28" />
                <button type="button" class="btn btn-ghost btn-xs text-error" title="Remove column" @click="removeColumn(ci)">
                  <Icon name="lucide:x" class="h-3 w-3" />
                </button>
              </div>
            </th>
            <th>
              <button type="button" class="btn btn-ghost btn-xs" title="Add column" @click="addColumn">
                <Icon name="lucide:plus" class="h-3.5 w-3.5" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in section.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci">
              <input v-model="section.rows[ri][ci]" class="input input-bordered input-xs w-28" />
            </td>
            <td>
              <button type="button" class="btn btn-ghost btn-xs text-error" title="Remove row" @click="section.rows.splice(ri, 1)">
                <Icon name="lucide:trash-2" class="h-3.5 w-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="btn btn-ghost btn-xs" @click="addRow">
        <Icon name="lucide:plus" class="h-3.5 w-3.5" /> Add row
      </button>
    </div>

    <!-- list -->
    <div v-else class="space-y-2 rounded-lg border border-base-200 p-3">
      <div v-for="(item, ii) in section.items" :key="ii" class="flex items-center gap-2">
        <span class="text-base-content/40">•</span>
        <input v-model="section.items[ii]" type="text" placeholder="List item" class="input input-bordered input-sm flex-1" />
        <button type="button" class="btn btn-ghost btn-xs text-error" @click="section.items.splice(ii, 1)">
          <Icon name="lucide:x" class="h-3.5 w-3.5" />
        </button>
      </div>
      <button type="button" class="btn btn-ghost btn-xs" @click="section.items.push('')">
        <Icon name="lucide:plus" class="h-3.5 w-3.5" /> Add item
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true },
  titleError: { type: String, default: '' },
});

// The parent owns the reactive object; we mutate it in place.
const section = computed(() => props.modelValue);

const addColumn = () => {
  section.value.columns.push(`Column ${section.value.columns.length + 1}`);
  section.value.rows.forEach((r) => r.push(''));
};
const removeColumn = (ci) => {
  section.value.columns.splice(ci, 1);
  section.value.rows.forEach((r) => r.splice(ci, 1));
};
const addRow = () => section.value.rows.push(section.value.columns.map(() => ''));
</script>
