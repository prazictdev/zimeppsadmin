import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'

const componentPath = new URL('../app/components/adminPlanDetail/itemView.vue', import.meta.url)

test('admin plan item view explains persisted statutory schedule compliance', () => {
  const { descriptor } = parse(fs.readFileSync(componentPath, 'utf8'))
  compileScript(descriptor, { id: 'admin-plan-statutory-schedule' })
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: componentPath.pathname,
    id: 'admin-plan-statutory-schedule',
  })

  assert.deepEqual(compiled.errors, [])
  assert.match(descriptor.template.content, /Statutory procurement schedule/)
  assert.match(descriptor.template.content, /Expected delivery/)
  assert.match(descriptor.template.content, /Legal-period assessment/)
  assert.match(descriptor.template.content, /Required/)
  assert.match(descriptor.template.content, /Planned/)
  assert.match(descriptor.scriptSetup.content, /CONFIGURATION_MISSING/)
  assert.match(descriptor.scriptSetup.content, /NON_COMPLIANT/)
  assert.match(descriptor.scriptSetup.content, /Meets minimum/)
  assert.match(descriptor.scriptSetup.content, /Below minimum/)
  assert.match(descriptor.scriptSetup.content, /Exemption-adjusted/)
})
