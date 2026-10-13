import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { parse, compileScript } from '@vue/compiler-sfc';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';

async function renderPanel(actions, recommendation) {
  const { descriptor } = parse(fs.readFileSync(new URL('../app/components/adminPlanDetail/actionPanel.vue', import.meta.url), 'utf8'));
  const store = {
    workflowActions: actions,
    plan: { year: 2026, company: { name: 'Review Entity' }, procurementclass: { name: 'Class A' } },
    recommendations: [{ cycle: 1, handler_comment: 'Outdated recommendation' }, { cycle: 2, handler: { name: 'Handler' }, manager: { name: 'Manager' }, manager_action: 'AGREE', manager_comment: 'Manager supports this recommendation.', ...recommendation }],
  };
  let code = compileScript(descriptor, { id: 'actions', inlineTemplate: true, templateOptions: { ssr: true } }).content;
  code = `import { ref, reactive, computed } from 'vue'; const useAdminPlanStore = () => (${JSON.stringify(store)}); const useAdminPlanHelper = () => ({});\n${code}`;
  code = code.replace(/from (["'])(vue(?:\/server-renderer)?)\1/g, (_, quote, name) => `from '${import.meta.resolve(name)}'`);
  const { default: component } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const app = createSSRApp(component, { planUuid: 'sample-plan' });
  app.component('Icon', { render: () => h('span') });
  return renderToString(app);
}

test('approver sees the latest recommendation chain and only permitted decisions', async () => {
  const html = await renderPanel(['approver_approve', 'approver_send_back_to_pe', 'approver_send_back_to_manager'], { handler_recommendation: 'APPROVE', handler_comment: 'Recommend approval.' });
  for (const text of ['Approver review', 'Recommend approval.', 'Manager supports this recommendation.', 'Approve plan', 'Return to manager', 'Final decision']) assert.ok(html.includes(text), text);
  assert.ok(html.includes('Return to procurement entity'));
  assert.ok(html.includes('Request clarification or corrections'));
  assert.ok(!html.includes('Outdated recommendation'));
});

test('send-back recommendation shows entity correction action without approval', async () => {
  const html = await renderPanel(['approver_send_back_to_pe', 'approver_send_back_to_manager'], { handler_recommendation: 'SEND_BACK', handler_comment: 'Corrections needed.' });
  assert.ok(html.includes('Return to procurement entity'));
  assert.ok(html.includes('Request clarification or corrections'));
  assert.ok(!html.includes('Approve plan'));
});

test('manager review retains its own action cards', async () => {
  const html = await renderPanel(['manager_agree', 'manager_disagree'], { handler_recommendation: 'APPROVE' });
  assert.ok(html.includes('Agree and forward'));
  assert.ok(html.includes('Return to handler'));
  assert.ok(!html.includes('Final decision'));
});

test('approver can maintain the class or submit an active replacement and reopening resets the decision', async () => {
  const { descriptor } = parse(fs.readFileSync(new URL('../app/components/adminPlanDetail/actionPanel.vue', import.meta.url), 'utf8'));
  const script = compileScript(descriptor, { id: 'class-decision' }).content;
  let code = `import { ref, reactive, computed } from 'vue';
    export const requests = [];
    const document = { getElementById: () => ({showModal() {}, close() {}}) };
    const useAdminPlanStore = () => ({workflowActions: ['approver_approve'], plan: {procurementclass_id: 1}, recommendations: [], runTransition: async (...args) => {requests.push(args); return true;}});
    const useAdminPlanHelper = () => ({});
    const useProcurementClassHelper = () => ({getProcurementClasses: async () => ({data: ref({data: [{id: 2, name: 'Class B', status: 'ACTIVE'}, {id: 3, name: 'Old class', status: 'ARCHIVED'}]}), error: ref(null)})});
    ${script}`;
  code = code.replace(/from (["'])vue\1/g, `from '${import.meta.resolve('vue')}'`);
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  const state = module.default.setup({planUuid: 'plan'}, {expose() {}});
  await state.openAction('approver_approve');
  assert.equal(state.classDecision.value, 'MAINTAIN');
  await state.confirm();
  assert.deepEqual(module.requests[0][3], {});
  await state.openAction('approver_approve');
  state.classDecision.value = 'CHANGE';
  await state.loadClasses();
  assert.equal(state.procurementClasses.value.length, 1);
  await state.confirm();
  assert.equal(module.requests.length, 1);
  assert.ok(state.modalError.value.includes('Select an available procurement class'));
  state.approvedClassId.value = 2;
  await state.confirm();
  assert.deepEqual(module.requests[1][3], {procurementclass_id: 2});
  await state.openAction('approver_approve');
  assert.equal(state.classDecision.value, 'MAINTAIN');
  assert.equal(state.approvedClassId.value, 0);
});
