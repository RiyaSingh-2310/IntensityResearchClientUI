import assert from 'node:assert/strict'
import { availableProfileKinds, industryAnswerLabel, industryCategoryLabel, isHealthcarePharmaceuticals, panelsForIndustryLabel } from './industryPanels'
import type { FormQuestion, ProfileSections } from './profileQuestions'

assert.deepEqual(panelsForIndustryLabel('1. Healthcare & Pharmaceuticals'), ['healthcare', 'patient'])
assert.deepEqual(panelsForIndustryLabel('Healthcare & Pharmaceuticals'), ['healthcare', 'patient'])
assert.equal(panelsForIndustryLabel('1. Healthcare & Pharmaceuticals').includes('b2b'), false)
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
assert.deepEqual(panelsForIndustryLabel(industryCategoryLabel(industryQuestion, '372')), ['healthcare', 'patient'])
assert.deepEqual(availableProfileKinds('1. Healthcare & Pharmaceuticals', ['b2b']), ['healthcare', 'patient'])

const before = panelsForIndustryLabel('2. Financial Services')
const during = panelsForIndustryLabel('1. Healthcare & Pharmaceuticals')
const after = panelsForIndustryLabel('5. Automotive & Transportation')
assert.deepEqual(before, ['b2b', 'patient'])
assert.deepEqual(during, ['healthcare', 'patient'])
assert.equal(during.includes('b2b'), false)
assert.deepEqual(after, ['b2b', 'patient'])

const sections: ProfileSections = { demographics: [industryQuestion], lifestyle: [], preferences: [] }
assert.equal(industryAnswerLabel(sections, { '27': '380' }), '2. Financial Services')
assert.equal(industryAnswerLabel(sections, {}), '')

const industryCatalog = [{"value":"357","label":"1. Healthcare & Pharmaceuticals"},{"value":"358","label":"2. Financial Services"},{"value":"359","label":"3. Technology & IT"},{"value":"360","label":"4. Consumer & Retail"},{"value":"361","label":"5. Automotive & Transportation"},{"value":"362","label":"6. Energy & Utilities"},{"value":"363","label":"7. Manufacturing & Industrial"},{"value":"364","label":"8. Construction & Real Estate"},{"value":"365","label":"9. Professional & Business Services"},{"value":"366","label":"10. Media & Entertainment"},{"value":"367","label":"11. Travel & Hospitality"},{"value":"368","label":"12. Education"},{"value":"372","label":"Hospitals & healthcare providers","parentValue":"357"},{"value":"373","label":"Pharmaceuticals","parentValue":"357"},{"value":"374","label":"Biotechnology","parentValue":"357"},{"value":"375","label":"Medical devices","parentValue":"357"},{"value":"376","label":"Diagnostics & laboratories","parentValue":"357"},{"value":"377","label":"Health insurance","parentValue":"357"},{"value":"378","label":"Digital health / HealthTech","parentValue":"357"},{"value":"379","label":"CRO / clinical research","parentValue":"357"},{"value":"380","label":"Banking","parentValue":"358"},{"value":"381","label":"Insurance","parentValue":"358"},{"value":"382","label":"Investment banking","parentValue":"358"},{"value":"383","label":"Asset management","parentValue":"358"},{"value":"384","label":"Private equity","parentValue":"358"},{"value":"385","label":"Hedge funds","parentValue":"358"},{"value":"386","label":"FinTech","parentValue":"358"},{"value":"387","label":"Payments","parentValue":"358"},{"value":"388","label":"Wealth management","parentValue":"358"},{"value":"389","label":"Lending / mortgages","parentValue":"358"},{"value":"390","label":"Software","parentValue":"359"},{"value":"391","label":"IT services","parentValue":"359"},{"value":"392","label":"SaaS","parentValue":"359"},{"value":"393","label":"Cybersecurity","parentValue":"359"},{"value":"394","label":"Cloud computing","parentValue":"359"},{"value":"395","label":"Artificial intelligence","parentValue":"359"},{"value":"396","label":"Data & analytics","parentValue":"359"},{"value":"397","label":"Hardware","parentValue":"359"},{"value":"398","label":"Semiconductors","parentValue":"359"},{"value":"399","label":"Telecommunications","parentValue":"359"},{"value":"400","label":"FMCG","parentValue":"360"},{"value":"401","label":"Retail","parentValue":"360"},{"value":"402","label":"E-commerce","parentValue":"360"},{"value":"403","label":"Consumer electronics","parentValue":"360"},{"value":"404","label":"Apparel & fashion","parentValue":"360"},{"value":"405","label":"Beauty & personal care","parentValue":"360"},{"value":"406","label":"Food & beverages","parentValue":"360"},{"value":"407","label":"Household products","parentValue":"360"},{"value":"408","label":"Luxury goods","parentValue":"360"},{"value":"409","label":"Automobiles","parentValue":"361"},{"value":"410","label":"Auto components","parentValue":"361"},{"value":"411","label":"Electric vehicles","parentValue":"361"},{"value":"412","label":"Commercial vehicles","parentValue":"361"},{"value":"413","label":"Mobility / ride-sharing","parentValue":"361"},{"value":"414","label":"Logistics","parentValue":"361"},{"value":"415","label":"Shipping","parentValue":"361"},{"value":"416","label":"Aviation","parentValue":"361"},{"value":"417","label":"Railways","parentValue":"361"},{"value":"418","label":"Oil & gas","parentValue":"362"},{"value":"419","label":"Renewable energy","parentValue":"362"},{"value":"420","label":"Solar","parentValue":"362"},{"value":"421","label":"Wind","parentValue":"362"},{"value":"422","label":"Electricity & utilities","parentValue":"362"},{"value":"423","label":"Nuclear energy","parentValue":"362"},{"value":"424","label":"Battery & energy storage","parentValue":"362"},{"value":"425","label":"Water utilities","parentValue":"362"},{"value":"426","label":"Machinery","parentValue":"363"},{"value":"427","label":"Industrial equipment","parentValue":"363"},{"value":"428","label":"Chemicals","parentValue":"363"},{"value":"429","label":"Construction materials","parentValue":"363"},{"value":"430","label":"Steel & metals","parentValue":"363"},{"value":"431","label":"Aerospace & defense","parentValue":"363"},{"value":"432","label":"Electronics manufacturing","parentValue":"363"},{"value":"433","label":"Packaging","parentValue":"363"},{"value":"434","label":"Industrial automation","parentValue":"363"},{"value":"435","label":"Residential real estate","parentValue":"364"},{"value":"436","label":"Commercial real estate","parentValue":"364"},{"value":"437","label":"Infrastructure","parentValue":"364"},{"value":"438","label":"Construction","parentValue":"364"},{"value":"439","label":"Property management","parentValue":"364"},{"value":"440","label":"Real estate investment","parentValue":"364"},{"value":"441","label":"Management consulting","parentValue":"365"},{"value":"442","label":"Market research","parentValue":"365"},{"value":"443","label":"Legal services","parentValue":"365"},{"value":"444","label":"Accounting","parentValue":"365"},{"value":"445","label":"HR & recruitment","parentValue":"365"},{"value":"446","label":"Advertising & marketing","parentValue":"365"},{"value":"447","label":"Business process outsourcing","parentValue":"365"},{"value":"448","label":"Corporate services","parentValue":"365"},{"value":"449","label":"Television","parentValue":"366"},{"value":"450","label":"Film","parentValue":"366"},{"value":"451","label":"Music","parentValue":"366"},{"value":"452","label":"Gaming","parentValue":"366"},{"value":"453","label":"Streaming","parentValue":"366"},{"value":"454","label":"Publishing","parentValue":"366"},{"value":"455","label":"Social media","parentValue":"366"},{"value":"456","label":"Sports & entertainment","parentValue":"366"},{"value":"457","label":"Hotels","parentValue":"367"},{"value":"458","label":"Restaurants","parentValue":"367"},{"value":"459","label":"Travel agencies","parentValue":"367"},{"value":"460","label":"Airlines","parentValue":"367"},{"value":"461","label":"Tourism","parentValue":"367"},{"value":"462","label":"Cruises","parentValue":"367"},{"value":"463","label":"Travel technology","parentValue":"367"},{"value":"464","label":"Schools","parentValue":"368"},{"value":"465","label":"Universities","parentValue":"368"},{"value":"466","label":"EdTech","parentValue":"368"},{"value":"467","label":"Vocational training","parentValue":"368"},{"value":"468","label":"Professional education","parentValue":"368"},{"value":"469","label":"Test preparation","parentValue":"368"}]
const catalogQuestion = { ...industryQuestion, options: industryCatalog }
let healthcareOptions = 0
let standardOptions = 0
for (const option of industryCatalog) {
  const category = industryCategoryLabel(catalogQuestion, option.value)
  const panels = panelsForIndustryLabel(category)
  if (isHealthcarePharmaceuticals(category)) {
    healthcareOptions += 1
    assert.deepEqual(panels, ['healthcare', 'patient'], option.label)
  } else {
    standardOptions += 1
    assert.deepEqual(panels, ['b2b', 'patient'], option.label)
  }
  assert.equal(availableProfileKinds(category, []).includes('b2b'), !isHealthcarePharmaceuticals(category), option.label)
}
assert.equal(industryCatalog.length, 110)
assert.equal(healthcareOptions, 9)
assert.equal(standardOptions, 101)

console.log('industry panel tests passed')
