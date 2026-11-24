import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc'

const components = ['evaluationCommittee', 'procurementManagementUnit', 'disposalCommittee']

function compile(name) {
  const url = new URL(`../app/components/adminPlanDetail/${name}.vue`, import.meta.url)
  const { descriptor } = parse(fs.readFileSync(url, 'utf8'))
  compileScript(descriptor, { id: name })
  const result = compileTemplate({ source: descriptor.template.content, filename: url.pathname, id: name })
  assert.deepEqual(result.errors, [])
  return descriptor.template.content
}

test('every admin committee tab provides a member profile action', () => {
  for (const component of components) {
    const template = compile(component)
    assert.ok(template.includes('AdminPlanDetailCommitteeMemberProfile'), component)
    assert.match(template, /@click="selectedMember = m"/)
    assert.match(template, /> View\s*</)
  }
})

test('shared profile dialog shows account, qualification and work-history details', () => {
  const url = new URL('../app/components/adminPlanDetail/committeeMemberProfile.vue', import.meta.url)
  const { descriptor } = parse(fs.readFileSync(url, 'utf8'))
  compileScript(descriptor, { id: 'committee-profile' })
  const result = compileTemplate({ source: descriptor.template.content, filename: url.pathname, id: 'committee-profile' })
  assert.deepEqual(result.errors, [])
  for (const label of ['User account', 'Qualifications', 'Work history', 'Email verification']) assert.ok(descriptor.template.content.includes(label))
})
