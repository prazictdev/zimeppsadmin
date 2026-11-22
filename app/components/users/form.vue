<template>
  <form class="space-y-5" @submit.prevent="handleSubmit">
    <div class="grid gap-4 sm:grid-cols-2">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">First name</legend>
        <input v-model.trim="form.name" class="input w-full" :class="{ 'input-error': errors.name }" />
        <p v-if="errors.name" class="label text-error">{{ errors.name }}</p>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Middle name</legend>
        <input v-model.trim="form.middlename" class="input w-full" />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Last name</legend>
        <input v-model.trim="form.lastname" class="input w-full" :class="{ 'input-error': errors.lastname }" />
        <p v-if="errors.lastname" class="label text-error">{{ errors.lastname }}</p>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Gender</legend>
        <select v-model="form.gender" class="select w-full" :class="{ 'select-error': errors.gender }">
          <option disabled value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <p v-if="errors.gender" class="label text-error">{{ errors.gender }}</p>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Email address</legend>
        <input v-model.trim="form.email" type="email" class="input w-full" :class="{ 'input-error': errors.email }" />
        <p v-if="errors.email" class="label text-error">{{ errors.email }}</p>
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Phone number</legend>
        <input v-model.trim="form.phone" type="tel" class="input w-full" :class="{ 'input-error': errors.phone }" />
        <p v-if="errors.phone" class="label text-error">{{ errors.phone }}</p>
      </fieldset>
    </div>

    <fieldset class="fieldset">
      <legend class="fieldset-legend">Company</legend>
      <label class="input w-full">
        <Icon name="lucide:search" class="h-4 w-4 opacity-50" />
        <input v-model.trim="accountSearch" type="search" placeholder="Search account name or registration number" @input="queueAccountSearch" />
        <span v-if="accountsLoading" class="loading loading-spinner loading-xs" />
      </label>
      <div class="max-h-52 overflow-y-auto rounded-box border border-base-300 bg-base-100 p-2">
        <label v-for="account in accounts" :key="account.id" class="flex cursor-pointer items-start gap-3 rounded-selector px-3 py-2 hover:bg-base-200">
          <input v-model="form.company_id" type="radio" name="user-company" class="radio radio-sm mt-0.5" :value="account.id" />
          <span class="min-w-0">
            <span class="block truncate text-sm font-medium">{{ account.name }}</span>
            <span class="block text-xs text-base-content/60">
              {{ account.regnumber || 'No registration number' }}
              <template v-if="account.accounttypes?.length"> · {{ account.accounttypes.map(type => type.name).join(', ') }}</template>
            </span>
          </span>
        </label>
        <p v-if="!accountsLoading && accounts.length === 0" class="px-3 py-5 text-center text-sm text-base-content/60">
          No accounts match your search.
        </p>
      </div>
      <p v-if="errors.company_id" class="label text-error">{{ errors.company_id }}</p>
    </fieldset>

    <div class="modal-action">
      <button type="button" class="btn" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        <span v-if="submitting" class="loading loading-spinner loading-xs" />
        {{ mode === 'create' ? 'Create user' : 'Save changes' }}
      </button>
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  user: { type: Object, default: null },
  accounts: { type: Array, default: () => [] },
  accountsLoading: { type: Boolean, default: false },
  submitting: { type: Boolean, default: false },
  mode: { type: String, default: 'create' },
});

const emit = defineEmits(['submit', 'cancel', 'search-accounts']);
const accountSearch = ref('');
let searchTimer;

const blankForm = () => ({
  name: '',
  middlename: '',
  lastname: '',
  gender: '',
  email: '',
  phone: '',
  company_id: null,
});

const form = ref(blankForm());
const errors = reactive({});

watch(
  () => props.user,
  (user) => {
    form.value = user
      ? {
          name: user.name ?? '',
          middlename: user.middlename ?? '',
          lastname: user.lastname ?? '',
          gender: String(user.gender ?? '').toLowerCase(),
          email: user.email ?? '',
          phone: user.phone ?? '',
          company_id: user.companies?.[0]?.id ?? null,
        }
      : blankForm();
    Object.keys(errors).forEach(key => delete errors[key]);
  },
  { immediate: true },
);

const queueAccountSearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => emit('search-accounts', accountSearch.value), 350);
};

const handleSubmit = async () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  try {
    const payload = await UserSchema.validate(form.value, { abortEarly: false });
    emit('submit', payload);
  } catch (error) {
    (error.inner ?? [error]).forEach((validationError) => {
      if (validationError.path && !errors[validationError.path]) {
        errors[validationError.path] = validationError.message;
      }
    });
  }
};
</script>
