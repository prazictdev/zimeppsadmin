import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'

const pagePath = new URL('../app/pages/admin-plan-dashboard/plans/[uuid].vue', import.meta.url)
const headerPath = new URL('../app/components/adminPlanDetail/header.vue', import.meta.url)

function compile(file, id) {
  const { descriptor } = parse(fs.readFileSync(file, 'utf8'))
  compileScript(descriptor, { id })
  const result = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id })
  assert.deepEqual(result.errors, [])
  return descriptor
}

test('admin plan view opens on entity-style plan items and does not render automatic analysis', () => {
  const descriptor = compile(pagePath, 'admin-plan-entity-layout')
  const source = descriptor.scriptSetup.content
  const template = descriptor.template.content

  assert.match(source, /: 'items'\)/)
  assert.match(template, /AdminPlanDetailItems v-if="activeTab === 'items'"/)
  assert.ok(!template.includes('AdminPlanDetailReviewAnalysis'))
  assert.ok(!source.includes('runAnalysis('))
  assert.ok(!template.includes('Plan analysis'))
  assert.ok(template.includes('aria-label="Plan sections"'))
})

test('compact summary retains workflow actions and removes the analyze control', () => {
  const descriptor = compile(headerPath, 'admin-plan-header')
  const template = descriptor.template.content

  assert.ok(template.includes('AdminPlanDetailActionPanel'))
  assert.ok(!template.includes('AdminPlanDetailAnalyze'))
  assert.ok(template.includes('Total budget'))
  assert.ok(template.includes('Plan items'))
  assert.ok(template.includes('Consolidated'))
})
