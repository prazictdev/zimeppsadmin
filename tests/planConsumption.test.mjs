import test from 'node:test';
import assert from 'node:assert/strict';
import { consumptionSplit, planConsumptionTotals } from '../app/utils/planConsumption.js';

test('each method uses its own value as the percentage denominator', () => {
  const split = consumptionSplit({ once_off: { value: 490, count: 1 }, drill_down: { value: 510, count: 99 } });
  assert.deepEqual(split.slices.map(slice => slice.percentage), [49, 51]);
});

test('whole-plan distribution sums values rather than averaging method percentages or item counts', () => {
  const totals = planConsumptionTotals([
    { once_off: { value: 490, count: 1 }, drill_down: { value: 510, count: 99 } },
    { once_off: { value: 100, count: 5 }, drill_down: { value: 0, count: 0 } },
  ]);
  assert.deepEqual(consumptionSplit(totals).slices.map(slice => slice.percentage), [53.6, 46.4]);
  assert.equal(totals.once_off.count, 6);
});

test('unclassified values remain in the denominator and get their own slice', () => {
  const split = consumptionSplit({ once_off: { value: 40 }, drill_down: { value: 40 }, unspecified: { value: 20 } });
  assert.deepEqual(split.slices.map(slice => slice.percentage), [40, 40, 20]);
});

test('zero and invalid values do not produce a misleading pie', () => {
  for (const values of [{}, { once_off: { value: -5 }, drill_down: { value: 10 } }, { once_off: { value: 'invalid' } }]) {
    const split = consumptionSplit(values);
    assert.equal(split.valid, false);
    assert.ok(split.slices.every(slice => slice.percentage === null));
  }
  assert.deepEqual(consumptionSplit({ drill_down: { value: 100 } }).slices.map(slice => slice.percentage), [0, 100]);
});
