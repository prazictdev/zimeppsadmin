<template>
  <div>
    <button class="btn btn-primary" type="button" @click="open">
      <Icon name="lucide:flask-conical" /> Generate session
    </button>

    <dialog ref="dialog" class="modal">
      <div class="modal-box max-w-4xl">
        <template v-if="!result">
          <div>
            <h2 class="text-xl font-bold">Generate a training session</h2>
            <p class="mt-1 text-sm text-base-content/55">Each test user receives an activated procurement-entity account.</p>
          </div>

          <form class="mt-5 space-y-4" @submit.prevent="submit">
            <label class="fieldset">
              <span class="fieldset-legend">Session name</span>
              <input v-model.trim="form.session_name" type="text" class="input w-full" :class="errors.session_name && 'input-error'" placeholder="e.g. Harare onboarding workshop" />
              <span v-if="errors.session_name" class="text-xs text-error">{{ errors.session_name }}</span>
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="fieldset">
                <span class="fieldset-legend">Number of test users</span>
                <input v-model.number="form.number_of_users" type="number" min="1" max="100" class="input w-full" :class="errors.number_of_users && 'input-error'" />
                <span v-if="errors.number_of_users" class="text-xs text-error">{{ errors.number_of_users }}</span>
              </label>
              <label class="fieldset">
                <span class="fieldset-legend">Validity period (days)</span>
                <input v-model.number="form.validity_period_days" type="number" min="1" max="365" class="input w-full" :class="errors.validity_period_days && 'input-error'" />
                <span v-if="errors.validity_period_days" class="text-xs text-error">{{ errors.validity_period_days }}</span>
              </label>
            </div>

            <div role="alert" class="alert alert-info alert-soft">
              <Icon name="lucide:info" class="h-5 w-5" />
              <span>Generation may take a moment. Every generated training user will use the password <code class="font-mono font-bold">password</code>.</span>
            </div>

            <div class="modal-action">
              <button class="btn" type="button" @click="close">Cancel</button>
              <button class="btn btn-primary" type="submit" :disabled="store.creating">
                <span v-if="store.creating" class="loading loading-spinner loading-sm"></span>
                {{ store.creating ? 'Generating accounts…' : 'Generate training session' }}
              </button>
            </div>
          </form>
        </template>

        <template v-else>
          <h2 class="text-xl font-bold">Training accounts are ready</h2>
          <div role="alert" class="alert alert-warning alert-soft mt-4">
            <Icon name="lucide:key-round" class="h-5 w-5" />
            <span>All generated accounts use the default password <code class="font-mono font-bold">password</code>. The password is stored securely as a hash.</span>
          </div>

          <div class="mt-4 overflow-x-auto rounded-box border border-base-300">
            <table class="table table-sm">
              <thead><tr><th>Procurement entity</th><th>Email</th><th>Password</th></tr></thead>
              <tbody>
                <tr v-for="credential in credentials" :key="credential.email">
                  <td>{{ credential.company_name }}</td>
                  <td class="font-mono text-xs">{{ credential.email }}</td>
                  <td class="font-mono text-xs">{{ credential.password }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-action">
            <button class="btn" type="button" @click="copyCredentials"><Icon name="lucide:copy" /> Copy</button>
            <button class="btn btn-primary" type="button" @click="downloadCsv"><Icon name="lucide:download" /> Download CSV</button>
            <button class="btn btn-neutral" type="button" @click="close">Done</button>
          </div>
        </template>
      </div>
      <form method="dialog" class="modal-backdrop"><button>Close</button></form>
    </dialog>
  </div>
</template>

<script setup>
const store = useTrainingSessionStore();
const toast = useToast();
const dialog = ref(null);
const result = ref(null);
const form = reactive({ session_name: '', number_of_users: 10, validity_period_days: 7 });
const errors = reactive({ session_name: '', number_of_users: '', validity_period_days: '' });
const credentials = computed(() => result.value?.credentials ?? []);

function reset() {
  Object.assign(form, { session_name: '', number_of_users: 10, validity_period_days: 7 });
  Object.keys(errors).forEach((key) => { errors[key] = ''; });
  result.value = null;
}
function open() {
  reset();
  dialog.value?.showModal();
}
function close() {
  dialog.value?.close();
  reset();
}
async function submit() {
  Object.keys(errors).forEach((key) => { errors[key] = ''; });
  try {
    const payload = await TrainingSessionSchema.validate(form, { abortEarly: false, stripUnknown: true });
    result.value = await store.create(payload);
  } catch (error) {
    error?.inner?.forEach((issue) => {
      if (issue.path && Object.prototype.hasOwnProperty.call(errors, issue.path)) errors[issue.path] = issue.message;
    });
  }
}
async function copyCredentials() {
  const text = credentials.value.map((item) => `${item.company_name}\t${item.email}\t${item.password}`).join('\n');
  await navigator.clipboard.writeText(text);
  toast.success({ title: 'Credentials copied', message: 'The account list is on your clipboard.', position: 'topRight', layout: 2 });
}
function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}
function downloadCsv() {
  const rows = [['Procurement entity', 'Email', 'Password'], ...credentials.value.map((item) => [item.company_name, item.email, item.password])];
  const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${form.session_name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-credentials.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
</script>
