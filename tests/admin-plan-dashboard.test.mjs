import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createPinia, setActivePinia } from 'pinia';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

const source = fs.readFileSync(new URL('../app/stores/adminPlanDashboard.js', import.meta.url), 'utf8')
  .replace("from 'pinia'", `from '${import.meta.resolve('pinia')}'`);
const code = `import { ref } from '${import.meta.resolve('vue')}';
const useAdminPlanDashboardHelper = () => globalThis.dashboardHelper;
${source}`;
const { useAdminPlanDashboardStore } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const keys = ['PENDING_ADMIN_AUTHORIZATION', 'PENDING_MANAGER_REVIEW', 'PENDING_APPROVER_DECISION', 'approved', 'revisited'];

test('loads every workflow lane and searches them all without reloading on selection', async () => {
  const requests = [];
  globalThis.dashboardHelper = {
    fetch: async () => ({ ok: true, data: {} }),
    fetchCompanies: async params => {
      requests.push(params);
      return { ok: true, data: { data: { data: [{ id: params.filter }], current_page: params.page, last_page: 3, total: 60, per_page: 25 } } };
    },
  };
  setActivePinia(createPinia());
  const store = useAdminPlanDashboardStore();
  await store.loadAllLanes(keys);
  assert.deepEqual(requests.map(row => row.filter), keys);
  assert.ok(keys.every(key => store.lane(key).loaded && store.lane(key).companies.length === 1));
  await store.setFilter('approved');
  assert.equal(requests.length, 5);
  await store.setSearch('Ministry');
  assert.equal(requests.length, 10);
  assert.ok(requests.slice(5).every(row => row.search === 'Ministry' && row.page === 1));
  await store.loadLane('approved', 2);
  assert.equal(store.lane('approved').meta.current_page, 2);
  assert.equal(store.lane('revisited').meta.current_page, 1);
});

test('one failed lane does not prevent the other lanes from loading', async () => {
  globalThis.dashboardHelper = {
    fetch: async () => ({ ok: true }),
    fetchCompanies: async params => ({ ok: params.filter !== 'approved', data: { data: { data: [] } } }),
  };
  setActivePinia(createPinia());
  const store = useAdminPlanDashboardStore();
  await store.loadAllLanes(keys);
  assert.ok(store.lane('approved').error);
  assert.ok(keys.filter(key => key !== 'approved').every(key => store.lane(key).loaded));
});

test('dashboard compiles and starts all lanes with the summary on mount', () => {
  const { descriptor } = parse(fs.readFileSync(new URL('../app/components/adminPlanDashboard/index.vue', import.meta.url), 'utf8'));
  compileScript(descriptor, { id: 'dashboard' });
  const result = compileTemplate({ source: descriptor.template.content, filename: 'dashboard.vue', id: 'dashboard' });
  assert.deepEqual(result.errors, []);
  assert.ok(descriptor.scriptSetup.content.includes('Promise.all([store.loadSummary(), store.loadAllLanes(tabs.map(tab => tab.key))])'));
});
