<template>
  <div>
    <button class="btn btn-info btn-sm" @click="openModal()">
      <Icon name="lucide:edit" />
      <span class="hidden md:block">Edit</span>
    </button>
    <dialog :id="`edit_district_modal_${district.id}`" class="modal">
      <div class="modal-box">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">Edit District</h3>
          <button
            class="btn btn-ghost btn-circle"
            :onclick="`document.getElementById('edit_district_modal_${district.id}').close()`"
          >
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="mt-3 flex flex-col gap-3">
            <label class="fieldset">
              <span class="fieldset-legend">Province</span>
              <select
                v-model="form.province_id"
                :class="['select select-bordered w-full', errors.province_id ? 'select-error' : '']"
              >
                <option value="" disabled>Select province</option>
                <option
                  v-for="prov in provinces"
                  :key="prov.id"
                  :value="prov.id"
                >
                  {{ prov.name }}
                </option>
              </select>
              <label v-if="errors.province_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.province_id }}</span>
              </label>
            </label>
            <label class="fieldset">
              <span class="fieldset-legend">Name</span>
              <input
                type="text"
                v-model="form.name"
                placeholder="e.g. Goromonzi"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>
          </div>
          <div class="modal-action">
            <button
              class="btn"
              type="button"
              :onclick="`document.getElementById('edit_district_modal_${district.id}').close()`"
            >
              Close
            </button>
            <button class="btn btn-primary" type="submit" :disabled="submitting">
              <span v-if="submitting">Saving...</span>
              <span v-else>Save</span>
            </button>
          </div>
        </form>
      </div>
    </dialog>
  </div>
</template>
<script setup>
const store = useDistrictStore();
const props = defineProps({
  district: { type: Object, required: true },
  provinces: { type: Array, default: () => [] },
});

const form = ref({ province_id: '', name: '' });
const errors = reactive({ province_id: '', name: '' });
const submitting = ref(false);

const openModal = async () => {
  const data = await store.findOne(props.district.id);
  if (data) {
    form.value = {
      province_id: data.province_id ?? data.province?.id ?? '',
      name: data.name ?? '',
    };
  }
  document.getElementById(`edit_district_modal_${props.district.id}`).showModal();
};

const handleSubmit = async () => {
  errors.province_id = '';
  errors.name = '';
  try {
    submitting.value = true;
    const validData = await DistrictSchema.validate(form.value, { abortEarly: false });
    await store.update(props.district.id, validData);
    document.getElementById(`edit_district_modal_${props.district.id}`).close();
  } catch (err) {
    if (err?.inner?.length) {
      err.inner.forEach((e) => {
        if (e.path && Object.prototype.hasOwnProperty.call(errors, e.path)) {
          errors[e.path] = e.message;
        }
      });
    } else if (err?.path && Object.prototype.hasOwnProperty.call(errors, err.path)) {
      errors[err.path] = err.message;
    }
  } finally {
    submitting.value = false;
  }
};
</script>
