<template>
  <div>
    <button class="btn btn-success btn-sm" onclick="new_company_modal.showModal()">
      <Icon name="lucide:plus" />
      <span class="hidden md:block">New Customer</span>
    </button>
    <dialog id="new_company_modal" class="modal">
      <div class="modal-box w-6/12 max-w-5xl">
        <div class="flex justify-between">
          <h3 class="text-lg font-bold">New customer</h3>
          <button class="btn btn-ghost btn-circle" onclick="new_company_modal.close()">
            <Icon name="lucide:x" />
          </button>
        </div>
        <form method="dialog" @submit.prevent="handleSubmit">
          <div class="col-span-2">
            <ul
              v-if="Object.values(errors).some((error) => error !== '')"
              class="bg-red-500/10 p-2 rounded-box border border-red-600"
            >
              <li v-for="(error, index) in errors" :key="index">
                <span class="label-text-alt text-red-600">{{ error }}</span>
              </li>
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-3">
            <label class="fieldset">
              <input
                type="text"
                v-model="form.name"
                placeholder="Customer name"
                :class="['input input-bordered w-full', errors.name ? 'input-error' : '']"
              />
              <label v-if="errors.name" class="label">
                <span class="label-text-alt text-red-600">{{ errors.name }}</span>
              </label>
            </label>

            <label class="fieldset">
              <input
                type="text"
                v-model="form.regnumber"
                placeholder="Registration number"
                :class="['input input-bordered w-full', errors.regnumber ? 'input-error' : '']"
              />
              <p class="label">If it is a new company, leave this field blank</p>
              <label v-if="errors.regnumber" class="label">
                <span class="label-text-alt text-red-600">{{ errors.regnumber }}</span>
              </label>
            </label>

            <label class="fieldset">
              <select
                v-model="form.country"
                :class="['select select-bordered w-full', errors.country ? 'select-error' : '']"
              >
                <option disabled value="">Select country</option>
                <option
                  v-for="country in countrylist"
                  :key="country.value"
                  :value="country.value"
                >
                  {{ country.label }}
                </option>
              </select>
              <label v-if="errors.country" class="label">
                <span class="label-text-alt text-red-600">{{ errors.country }}</span>
              </label>
            </label>

            <label class="fieldset">
              <select
                v-model="form.companycategory_id"
                @change="handleCategoryChange"
                :class="[
                  'select select-bordered w-full',
                  errors.companycategory_id ? 'select-error' : '',
                ]"
              >
                <option disabled value="">Select company category</option>
                <option
                  v-for="category in companycategories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <label v-if="errors.companycategory_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.companycategory_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <select
                v-model="form.companysubcategory_id"
                :disabled="!form.companycategory_id"
                :class="[
                  'select select-bordered w-full',
                  errors.companysubcategory_id ? 'select-error' : '',
                ]"
              >
                <option disabled value="">Select company subcategory</option>
                <option
                  v-for="subcategory in companysubcategories"
                  :key="subcategory.id"
                  :value="subcategory.id"
                >
                  {{ subcategory.name }}
                </option>
              </select>
              <label v-if="errors.companysubcategory_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.companysubcategory_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <select
                v-model="form.companyindustry_id"
                :class="[
                  'select select-bordered w-full',
                  errors.companyindustry_id ? 'select-error' : '',
                ]"
              >
                <option disabled value="">Select company industry</option>
                <option
                  v-for="industry in companyindustries"
                  :key="industry.id"
                  :value="industry.id"
                >
                  {{ industry.name }}
                </option>
              </select>
              <label v-if="errors.companyindustry_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.companyindustry_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <select
                v-model="form.province_id"
                @change="handleProvinceChange"
                :class="[
                  'select select-bordered w-full',
                  errors.province_id ? 'select-error' : '',
                ]"
              >
                <option disabled value="">Select province</option>
                <option
                  v-for="province in provinces"
                  :key="province.id"
                  :value="province.id"
                >
                  {{ province.name }}
                </option>
              </select>
              <label v-if="errors.province_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.province_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <select
                v-model="form.district_id"
                :disabled="!form.province_id"
                :class="[
                  'select select-bordered w-full',
                  errors.district_id ? 'select-error' : '',
                ]"
              >
                <option disabled value="">Select district</option>
                <option
                  v-for="district in districts"
                  :key="district.id"
                  :value="district.id"
                >
                  {{ district.name }}
                </option>
              </select>
              <label v-if="errors.district_id" class="label">
                <span class="label-text-alt text-red-600">{{ errors.district_id }}</span>
              </label>
            </label>

            <label class="fieldset">
              <input
                type="text"
                v-model="form.city"
                placeholder="City"
                :class="['input input-bordered w-full', errors.city ? 'input-error' : '']"
              />
              <label v-if="errors.city" class="label">
                <span class="label-text-alt text-red-600">{{ errors.city }}</span>
              </label>
            </label>

            <label class="fieldset">
              <input
                type="text"
                v-model="form.address"
                placeholder="Address"
                :class="['input input-bordered w-full', errors.address ? 'input-error' : '']"
              />
              <label v-if="errors.address" class="label">
                <span class="label-text-alt text-red-600">{{ errors.address }}</span>
              </label>
            </label>

            <label class="fieldset">
              <input
                type="text"
                v-model="form.phone"
                placeholder="Phone"
                :class="['input input-bordered w-full', errors.phone ? 'input-error' : '']"
              />
              <label v-if="errors.phone" class="label">
                <span class="label-text-alt text-red-600">{{ errors.phone }}</span>
              </label>
            </label>

            <label class="fieldset">
              <input
                type="email"
                v-model="form.email"
                placeholder="Email"
                :class="['input input-bordered w-full', errors.email ? 'input-error' : '']"
              />
              <label v-if="errors.email" class="label">
                <span class="label-text-alt text-red-600">{{ errors.email }}</span>
              </label>
            </label>

            <label class="fieldset col-span-2">
              <input
                type="text"
                v-model="form.website"
                placeholder="Website"
                :class="['input input-bordered w-full', errors.website ? 'input-error' : '']"
              />
              <label v-if="errors.website" class="label">
                <span class="label-text-alt text-red-600">{{ errors.website }}</span>
              </label>
            </label>
          </div>

          <div
            role="alert"
            class="alert alert-warning alert-vertical sm:alert-horizontal mt-3"
            v-if="selectedaccounttypes.length > 0"
          >
            <span>
              You have selected {{ selectedaccounttypes.length }} account types to assign to the
              company.
            </span>
            <div>
              <button class="btn btn-sm btn-error" @click="clearselectedaccounttypes">
                Clear all
              </button>
            </div>
          </div>

          <p v-if="errors.accounttypes" class="text-red-600 text-sm mt-2">
            {{ errors.accounttypes }}
          </p>

          <ul class="list bg-base-100 rounded-box border border-base-200 mt-3">
            <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">Select Account Types</li>
            <li
              class="list-row"
              v-for="(item, index) in accounttypes"
              :key="index"
            >
              <div>{{ index + 1 }}</div>
              <div>
                <div>{{ item?.name }}</div>
              </div>

              <button
                class="btn btn-square btn-success"
                @click.prevent="selectaccounttype(item?.id)"
                :disabled="selectedaccounttypes.includes(item?.id)"
              >
                <Icon name="lucide:check" />
              </button>
              <button
                class="btn btn-square btn-error"
                @click.prevent="unselectaccounttype(item?.id)"
                :disabled="!selectedaccounttypes.includes(item?.id)"
              >
                <Icon name="lucide:x" />
              </button>
            </li>
          </ul>

          <div class="modal-action">
            <button class="btn" type="button" onclick="new_company_modal.close()">Close</button>
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
const companyStore = useCompanyStore();
const companyCategoryStore = useCompanyCategoryStore();
const provinceStore = useProvinceStore();
const { getCompanyIndustries } = useCompanyIndustryHelper();
const { getCompanySubcategories } = useCompanySubcategoryHelper();
const { getDistricts } = useDistrictHelper();

const initialFormState = () => ({
  name: '',
  regnumber: '',
  country: '',
  companycategory_id: '',
  companysubcategory_id: '',
  companyindustry_id: '',
  province_id: '',
  district_id: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  accounttypes: [],
});

const form = ref(initialFormState());
const errors = reactive({
  name: '',
  regnumber: '',
  country: '',
  companycategory_id: '',
  companysubcategory_id: '',
  companyindustry_id: '',
  province_id: '',
  district_id: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  accounttypes: '',
});
const submitting = ref(false);
const countrylist = ref(countryOptions);
const selectedaccounttypes = ref([]);
const companyindustries = ref([]);
const companysubcategories = ref([]);
const districts = ref([]);

const props = defineProps({
  regulator: { type: Boolean, default: false },
  accounttypes: { type: Array, default: [] },
});

const companycategories = computed(() => companyCategoryStore.allCategories ?? []);
const provinces = computed(() => provinceStore.allProvinces ?? []);

const accounttypes = computed(() =>
  props.regulator
    ? props.accounttypes?.filter(
        (accounttype) => !accounttype.name.toLowerCase().includes('regulator'),
      )
    : props.accounttypes ?? [],
);

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = '';
  });
};

const fetchCompanyIndustries = async () => {
  const { ok, data } = await getCompanyIndustries('', 1, 1000);
  companyindustries.value = ok ? data?.data ?? [] : [];
};

const fetchCompanySubcategories = async (categoryId) => {
  if (!categoryId) {
    companysubcategories.value = [];
    return;
  }
  const { ok, data } = await getCompanySubcategories('', 1, 1000, categoryId);
  companysubcategories.value = ok ? data?.data ?? [] : [];
};

const fetchDistrictOptions = async (provinceId) => {
  if (!provinceId) {
    districts.value = [];
    return;
  }
  const { ok, data } = await getDistricts('', 1, 1000, provinceId);
  districts.value = ok ? data?.data ?? [] : [];
};

const loadMasterData = async () => {
  await Promise.all([
    companyCategoryStore.fetchAllCategories(),
    provinceStore.fetchAllProvinces(),
    fetchCompanyIndustries(),
  ]);
};

onMounted(async () => {
  await loadMasterData();
});

const handleCategoryChange = async () => {
  errors.companycategory_id = '';
  form.value.companysubcategory_id = '';
  await fetchCompanySubcategories(form.value.companycategory_id);
};

const handleProvinceChange = async () => {
  errors.province_id = '';
  form.value.district_id = '';
  await fetchDistrictOptions(form.value.province_id);
};

const resetForm = () => {
  form.value = initialFormState();
  clearErrors();
  selectedaccounttypes.value = [];
  companysubcategories.value = [];
  districts.value = [];
};

const handleSubmit = async () => {
  clearErrors();
  try {
    submitting.value = true;
    form.value.accounttypes = [...new Set(selectedaccounttypes.value)];
    const validData = await CompanySchema.validate(form.value, { abortEarly: false });
    await companyStore.create(validData);
    resetForm();
    document.getElementById('new_company_modal').close();
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

const selectaccounttype = (accounttypeId) => {
  if (!selectedaccounttypes.value.includes(accounttypeId)) {
    selectedaccounttypes.value.push(accounttypeId);
  }
};

const unselectaccounttype = (accounttypeId) => {
  selectedaccounttypes.value = selectedaccounttypes.value.filter((id) => id !== accounttypeId);
};

const clearselectedaccounttypes = () => {
  selectedaccounttypes.value = [];
};
</script>
