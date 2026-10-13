<template>
  <div class="p-6">
    <div class="card outline card-xs outline-1 outline-base-200">
      <div class="card-body">
        <div class="breadcrumbs text-sm">
          <ul><li><NuxtLink to="/">Home</NuxtLink></li><li>System configuration</li></ul>
        </div>
      </div>
    </div>

    <div v-if="canAccess" class="mt-4 w-full">
      <div class="card border border-base-200 bg-base-100 shadow-sm">
        <div class="card-body gap-5">
          <div>
            <h1 class="card-title">Annual procurement plan</h1>
            <p class="mt-1 text-sm text-base-content/60">Drill-down procurement is enabled for every procurement entity by default.</p>
          </div>

          <div role="alert" class="alert alert-info items-start">
            <Icon name="lucide:info" class="mt-0.5 shrink-0" />
            <span>Add an entity below when it must consume each APP line in full, for example when procurement splitting requires tighter control.</span>
          </div>

          <div class="rounded-xl border border-base-300 p-4">
            <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="font-semibold">Non-drill-down procurement entities</h2>
                <p class="text-sm text-base-content/60">Listed entities cannot use multiple partial procurements against one APP line.</p>
              </div>
              <span class="badge badge-neutral">{{ nonDrillDownEntities.length }} restricted</span>
            </div>

            <div v-if="canEdit" class="relative mt-4">
              <label class="input input-bordered flex w-full items-center gap-2">
                <Icon name="lucide:search" class="text-base-content/50" />
                <input
                  v-model="entitySearch"
                  type="search"
                  class="grow"
                  placeholder="Search procurement entities by name or registration number"
                  @input="queueEntitySearch"
                />
                <span v-if="searching" class="loading loading-spinner loading-xs"></span>
              </label>

              <div v-if="showSearchResults" class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-xl">
                <button
                  v-for="entity in availableSearchResults"
                  :key="entity.id"
                  type="button"
                  class="flex w-full items-center justify-between gap-3 border-b border-base-200 px-4 py-3 text-left last:border-b-0 hover:bg-base-200"
                  @click="addEntity(entity)"
                >
                  <span>
                    <span class="block font-medium">{{ entity.name }}</span>
                    <span class="block text-xs text-base-content/60">{{ entity.regnumber || 'No registration number' }}</span>
                  </span>
                  <Icon name="lucide:plus" />
                </button>
                <p v-if="!searching && availableSearchResults.length === 0" class="px-4 py-3 text-sm text-base-content/60">No matching procurement entities available.</p>
              </div>
            </div>

            <div class="mt-4 overflow-x-auto">
              <table class="table table-sm">
                <thead><tr><th>Entity</th><th>Registration number</th><th v-if="canEdit" class="w-20 text-right">Action</th></tr></thead>
                <tbody>
                  <tr v-for="entity in nonDrillDownEntities" :key="entity.id">
                    <td class="font-medium">{{ entity.name }}</td>
                    <td>{{ entity.regnumber || '—' }}</td>
                    <td v-if="canEdit" class="text-right">
                      <button type="button" class="btn btn-ghost btn-xs text-error" title="Allow drill-down again" @click="removeEntity(entity.id)">
                        <Icon name="lucide:trash-2" />
                      </button>
                    </td>
                  </tr>
                  <tr v-if="nonDrillDownEntities.length === 0">
                    <td :colspan="canEdit ? 3 : 2" class="py-8 text-center text-base-content/60">No entities are restricted. Drill-down procurement is available to all procurement entities.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-if="message" role="alert" :class="['alert', messageType === 'success' ? 'alert-success' : 'alert-error']">
            <span>{{ message }}</span>
          </div>

          <div v-if="canEdit" class="card-actions justify-end">
            <button class="btn btn-success" :disabled="loading || saving" @click="save">
              <span v-if="saving" class="loading loading-spinner loading-sm"></span>
              {{ saving ? 'Saving…' : 'Save restricted entities' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-error mt-4">
      <Icon name="lucide:alert-circle" />
      <span>You do not have permission to access system configuration.</span>
    </div>
    <Loader :loading="loading" />
  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' });
useHead({ title: 'System configuration' });

const { canAccess, canEdit } = useCheckPermission('systemsettings');
const { getProcurementPlanSettings, updateProcurementPlanSettings, searchProcurementEntities } = useSystemSettingHelper();
const nonDrillDownEntities = ref([]);
const entitySearch = ref('');
const entitySearchResults = ref([]);
const searching = ref(false);
const loading = ref(false);
const saving = ref(false);
const message = ref('');
const messageType = ref('success');
let searchTimer;

const availableSearchResults = computed(() => {
  const selectedIds = new Set(nonDrillDownEntities.value.map(entity => Number(entity.id)));
  return entitySearchResults.value.filter(entity => !selectedIds.has(Number(entity.id)));
});
const showSearchResults = computed(() => entitySearch.value.trim().length > 0);

const applySettings = (data) => {
  nonDrillDownEntities.value = Array.isArray(data?.non_drill_down_entities) ? data.non_drill_down_entities : [];
};

const load = async () => {
  loading.value = true;
  try {
    const response = await getProcurementPlanSettings();
    applySettings(response.data);
  } catch (error) {
    messageType.value = 'error';
    message.value = error?.data?.message || 'Could not load system configuration.';
  } finally {
    loading.value = false;
  }
};

const findEntities = async () => {
  const search = entitySearch.value.trim();
  if (!search) {
    entitySearchResults.value = [];
    return;
  }

  searching.value = true;
  try {
    const response = await searchProcurementEntities(search);
    entitySearchResults.value = response.data?.data ?? [];
  } catch (error) {
    messageType.value = 'error';
    message.value = error?.data?.message || 'Could not search procurement entities.';
  } finally {
    searching.value = false;
  }
};

const queueEntitySearch = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(findEntities, 250);
};

const addEntity = (entity) => {
  if (!nonDrillDownEntities.value.some(selected => Number(selected.id) === Number(entity.id))) {
    nonDrillDownEntities.value.push(entity);
  }
  entitySearch.value = '';
  entitySearchResults.value = [];
};

const removeEntity = (entityId) => {
  nonDrillDownEntities.value = nonDrillDownEntities.value.filter(entity => Number(entity.id) !== Number(entityId));
};

const save = async () => {
  saving.value = true;
  message.value = '';
  try {
    const response = await updateProcurementPlanSettings({
      non_drill_down_entity_ids: nonDrillDownEntities.value.map(entity => Number(entity.id)),
    });
    applySettings(response.data);
    messageType.value = 'success';
    message.value = 'Non-drill-down entity list saved.';
  } catch (error) {
    messageType.value = 'error';
    message.value = error?.data?.message || 'Could not save system configuration.';
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (canAccess.value) load();
});

onBeforeUnmount(() => clearTimeout(searchTimer));
</script>
