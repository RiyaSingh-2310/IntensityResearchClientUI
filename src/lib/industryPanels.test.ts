import assert from 'node:assert/strict'
import { availableProfileKinds, industryAnswerLabel, industryCategoryLabel, isHealthcarePharmaceuticals, panelsForIndustryLabel } from './industryPanels'
import type { FormQuestion, ProfileSections } from './profileQuestions'

assert.deepEqual(panelsForIndustryLabel('1. Healthcare & Pharmaceuticals'), ['b2b', 'healthcare', 'patient'])
assert.deepEqual(panelsForIndustryLabel('Healthcare & Pharmaceuticals'), ['b2b', 'healthcare', 'patient'])
assert.equal(isHealthcarePharmaceuticals('Pharmaceuticals'), false)
assert.equal(isHealthcarePharmaceuticals('Hospitals & healthcare providers'), false)
assert.deepEqual(panelsForIndustryLabel(''), [])
assert.deepEqual(availableProfileKinds('2. Financial Services', ['b2b']), ['patient'])
assert.deepEqual(availableProfileKinds('2. Financial Services', ['b2b', 'patient']), [])
assert.deepEqual(availableProfileKinds('', []), [])

for (const label of ['2. Financial Services', '3. Technology & IT', '4. Consumer & Retail', 'IT services', 'Banking', 'Education']) {
  assert.deepEqual(panelsForIndustryLabel(label), ['b2b', 'patient'], label)
}

const industryQuestion = {
  key: '27',
  section: 'demographics',
  label: 'Which industry does your organization primarily operate in?',
  fieldType: 'dropdown',
  required: true,
  options: [
    { value: '357', label: '1. Healthcare & Pharmaceuticals' },
    { value: '358', label: '2. Financial Services' },
    { value: '372', label: 'Hospitals & healthcare providers', parentValue: '357' },
    { value: '380', label: 'Banking', parentValue: '358' },
  ],
  api: {
    id: 27,
    step_no: 2,
    question_text: 'Which industry does your organization primarily operate in?',
    field_type: 'dropdown',
    dropdown_category: 'Industry',
    is_required: 1,
    options: [],
  },
} satisfies FormQuestion

assert.equal(industryCategoryLabel(industryQuestion, '380'), '2. Financial Services')
assert.equal(industryCategoryLabel(industryQuestion, '372'), '1. Healthcare & Pharmaceuticals')
assert.equal(industryCategoryLabel(industryQuestion, '358'), '2. Financial Services')
assert.deepEqual(panelsForIndustryLabel(industryCategoryLabel(industryQuestion, '380')), ['b2b', 'patient'])
assert.deepEqual(panelsForIndustryLabel(industryCategoryLabel(industryQuestion, '372')), ['b2b', 'healthcare', 'patient'])

const sections: ProfileSections = { demographics: [industryQuestion], lifestyle: [], preferences: [] }
assert.equal(industryAnswerLabel(sections, { '27': '380' }), '2. Financial Services')
assert.equal(industryAnswerLabel(sections, {}), '')

console.log('industry panel tests passed')
