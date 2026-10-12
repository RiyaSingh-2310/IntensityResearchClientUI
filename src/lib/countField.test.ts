import assert from 'node:assert/strict'
import { countError, countMaxDigits, isCountQuestion, rejectedCountMessage, sanitizeCount } from './countField'
import { rejectedNameMessage, sanitizeName } from './validation'
import { validateQuestions, type FormQuestion } from './profileQuestions'

assert.equal(isCountQuestion('How many children under 18 live in your household?'), true)
assert.equal(isCountQuestion('Approximately how many employees work for your organization worldwide?'), true)
assert.equal(isCountQuestion('How many years of professional experience do you have?'), true)
assert.equal(isCountQuestion('What is your ZIP/Postal/PIN code?'), false)
assert.equal(isCountQuestion('Which industry does your organization primarily operate in?'), false)

assert.equal(countMaxDigits('How many children under 18 live in your household?'), 2)
assert.equal(countMaxDigits('How many years have you been practicing in your profession?'), 3)
assert.equal(sanitizeCount('12ab 3', 2), '12')
assert.equal(countError('12', 2), '')
assert.equal(countError('123', 2), 'Enter a whole number using digits only.')
assert.equal(countError('', 2), '')

const children: FormQuestion = {
  key: '8',
  section: 'demographics',
  label: 'How many children under 18 live in your household?',
  fieldType: 'text',
  required: true,
  options: [],
  api: {
    id: 8,
    step_no: 2,
    question_text: 'How many children under 18 live in your household?',
    field_type: 'text',
    dropdown_category: null,
    is_required: 1,
    options: [],
  },
}
assert.equal(validateQuestions([children], { '8': '2' })['q-8'], undefined)
assert.equal(validateQuestions([children], { '8': '100' })['q-8'], 'Enter a whole number using digits only.')

assert.equal(rejectedCountMessage('12ab', 2), 'Enter a whole number using digits only.')
assert.equal(rejectedCountMessage('12', 2), '')
assert.equal(rejectedNameMessage('Riya2'), 'Use letters only. Spaces, hyphens, and apostrophes are allowed.')
assert.equal(rejectedNameMessage('José'), '')
assert.equal(sanitizeName("O'Connor2"), "O'Connor")
assert.equal(sanitizeName('José-Álvarez'), 'José-Álvarez')
assert.equal(sanitizeName('A'.repeat(40)).length, 30)

console.log('count and name tests passed')
