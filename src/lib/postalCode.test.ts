import assert from 'node:assert/strict'
import { postalCodeError, sanitizePostalInput } from './postalCode'
import { validateQuestions, type FormQuestion } from './profileQuestions'

assert.equal(sanitizePostalInput('India', '5600ab-1'), '56001')
assert.equal(sanitizePostalInput('India', '5600019'), '560001')
assert.equal(postalCodeError('India', '560001'), '')
assert.equal(postalCodeError('1. India', '56001'), 'Enter a 6-digit PIN code.')
assert.equal(postalCodeError('India', ''), '')

assert.equal(postalCodeError('United States', '94107'), '')
assert.equal(postalCodeError('United States', '94107-1234'), '')
assert.equal(postalCodeError('United States', '9410'), 'Enter a 5-digit ZIP code, or ZIP+4 as 12345-6789.')
assert.equal(sanitizePostalInput('United States', '94107abc1234'), '94107-1234')

assert.equal(postalCodeError('Canada', 'K1A 0B1'), '')
assert.equal(postalCodeError('Canada', 'K1A0B1'), 'Enter a Canadian postal code, such as A1A 1A1.')
assert.equal(sanitizePostalInput('Canada', 'k1a0b1'), 'K1A 0B1')

assert.equal(postalCodeError('United Kingdom', 'SW1A 1AA'), '')
assert.equal(postalCodeError('United Kingdom', 'SW1A1AA'), 'Enter a UK postcode, such as SW1A 1AA.')

assert.equal(postalCodeError('Germany', '10115'), '')
assert.equal(postalCodeError('France', '7500A'), 'Enter a 5-digit postal code.')

const country: FormQuestion = {
  key: '1',
  section: 'demographics',
  label: 'Which country do you currently live or work in?',
  fieldType: 'dropdown',
  required: true,
  options: [{ value: '99', label: 'India' }],
  api: { id: 1, step_no: 2, question_text: 'Which country do you currently live or work in?', field_type: 'dropdown', dropdown_category: 'Country', is_required: 1, options: [{ id: 99, name: 'India' }] },
}
const postal: FormQuestion = {
  key: '2',
  section: 'demographics',
  label: 'What is your ZIP/Postal/PIN code?',
  fieldType: 'text',
  required: true,
  options: [],
  api: { id: 2, step_no: 2, question_text: 'What is your ZIP/Postal/PIN code?', field_type: 'text', dropdown_category: null, is_required: 1, options: [] },
}

assert.equal(validateQuestions([country, postal], { '1': '99', '2': '560001' })['q-2'], undefined)
assert.equal(validateQuestions([country, postal], { '1': '99', '2': '5600' })['q-2'], 'Enter a 6-digit PIN code.')
assert.ok(validateQuestions([country, postal], { '1': '99', '2': '' })['q-2'])

console.log('postal code tests passed')
