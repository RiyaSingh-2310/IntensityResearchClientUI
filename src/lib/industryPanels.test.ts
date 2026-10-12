import assert from 'node:assert/strict'
import {
  applyIndustryChange,
  isHealthcarePharmaceuticals,
  panelsForIndustryLabel,
  prunePanelSelection,
} from './industryPanels'

assert.deepEqual(panelsForIndustryLabel('1. Healthcare & Pharmaceuticals'), ['b2b', 'healthcare', 'patient'])
assert.deepEqual(panelsForIndustryLabel('Healthcare & Pharmaceuticals'), ['b2b', 'healthcare', 'patient'])
assert.equal(isHealthcarePharmaceuticals('Pharmaceuticals'), false)
assert.equal(isHealthcarePharmaceuticals('Hospitals & healthcare providers'), false)

for (const label of ['2. Financial Services', '3. Technology & IT', '4. Consumer & Retail', 'IT services', 'Banking', 'Education']) {
  assert.deepEqual(panelsForIndustryLabel(label), ['b2b', 'patient'], label)
}

assert.deepEqual(prunePanelSelection(['b2b', 'healthcare', 'patient'], ['b2b', 'patient']), ['b2b', 'patient'])
assert.deepEqual(prunePanelSelection(['healthcare'], ['b2b', 'healthcare', 'patient']), ['healthcare'])
assert.deepEqual(panelsForIndustryLabel(''), [])

const allPanels = ['b2b', 'healthcare', 'patient'] as const
assert.deepEqual(applyIndustryChange(allPanels, '1. Healthcare & Pharmaceuticals'), {
  open: true,
  kinds: ['b2b', 'healthcare', 'patient'],
})
assert.deepEqual(applyIndustryChange(allPanels, '3. Technology & IT'), {
  open: true,
  kinds: ['b2b', 'patient'],
})
assert.deepEqual(applyIndustryChange(allPanels, '2. Financial Services'), {
  open: true,
  kinds: ['b2b', 'patient'],
})
assert.deepEqual(applyIndustryChange(allPanels, '4. Consumer & Retail'), {
  open: true,
  kinds: ['b2b', 'patient'],
})
assert.deepEqual(applyIndustryChange(['healthcare'], 'Banking').kinds, [])
assert.deepEqual(applyIndustryChange(['b2b', 'patient'], ''), {
  open: false,
  kinds: ['b2b', 'patient'],
})
assert.deepEqual(applyIndustryChange(['b2b', 'patient'], '1. Healthcare & Pharmaceuticals').kinds, ['b2b', 'patient'])

console.log('industry panel tests passed')
