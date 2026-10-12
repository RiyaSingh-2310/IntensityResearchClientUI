import assert from 'node:assert/strict'
import { isHealthcarePharmaceuticals, panelsForIndustryLabel } from './industryPanels'

assert.deepEqual(panelsForIndustryLabel('1. Healthcare & Pharmaceuticals'), ['b2b', 'healthcare', 'patient'])
assert.deepEqual(panelsForIndustryLabel('Healthcare & Pharmaceuticals'), ['b2b', 'healthcare', 'patient'])
assert.equal(isHealthcarePharmaceuticals('Pharmaceuticals'), false)
assert.equal(isHealthcarePharmaceuticals('Hospitals & healthcare providers'), false)
assert.deepEqual(panelsForIndustryLabel(''), [])

for (const label of ['2. Financial Services', '3. Technology & IT', '4. Consumer & Retail', 'IT services', 'Banking', 'Education']) {
  assert.deepEqual(panelsForIndustryLabel(label), ['b2b', 'patient'], label)
}

console.log('industry panel tests passed')
