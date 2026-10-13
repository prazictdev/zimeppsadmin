import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { createPinia, setActivePinia } from 'pinia';
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';

test('server approval errors stay in the open dialog and a retry clears the error', async () => {
  const storeSource = fs.readFileSync(new URL('../app/stores/adminPlan.js', import.meta.url), 'utf8');
  const { descriptor } = parse(fs.readFileSync(new URL('../app/components/adminPlanDetail/actionPanel.vue', import.meta.url), 'utf8'));
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: 'actionPanel.vue', id: 'errors' }).errors, []);
  let code = `import { ref, reactive, computed } from 'vue';
    export const closed = [];
    export let response = {ok: false, error: {data: {message: 'No authorization fee configured for this class.'}}};
    export const setResponse = value => response = value;
    const useAdminPlanHelper = () => new Proxy({}, {get: (_, key) => async () => {
      if (key === 'transition') { if (response === 'throw') throw new Error('Network failure'); return response; }
      return {ok: false};
    }});
    const useToast = () => ({success() {}, error() {throw new Error('Error must be displayed in the dialog');}});
    const document = {getElementById: id => ({showModal() {}, close() {closed.push(id);}})};
    ${storeSource}
    ${compileScript(descriptor, { id: 'errors' }).content}`;
  code = code.replace(/from (["'])(vue|pinia)\1/g, (_, quote, name) => `from '${import.meta.resolve(name)}'`);
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  setActivePinia(createPinia());
  const store = module.useAdminPlanStore();
  store.workflowActions = ['approver_approve'];
  const state = module.default.setup({planUuid: 'plan'}, {expose() {}});
  await state.openAction('approver_approve');
  state.modalComment.value = 'Reviewed and approved.';
  await state.confirm();
  assert.equal(state.modalError.value, 'No authorization fee configured for this class.');
  assert.equal(state.modalComment.value, 'Reviewed and approved.');
  assert.equal(state.activeAction.value, 'approver_approve');
  assert.equal(state.saving.value, false);
  assert.deepEqual(module.closed, []);
  module.setResponse('throw');
  await state.confirm();
  assert.match(state.modalError.value, /Please try again/);
  assert.equal(state.saving.value, false);
  assert.deepEqual(module.closed, []);
  module.setResponse({ok: true, data: {status: true, message: 'Approved'}});
  await state.confirm();
  assert.equal(state.modalError.value, '');
  assert.equal(store.transitionError, '');
  assert.deepEqual(module.closed, ['admin_action_modal', 'admin_action_panel_modal']);
});
