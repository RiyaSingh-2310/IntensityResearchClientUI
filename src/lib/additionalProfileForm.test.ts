import assert from 'node:assert/strict'
import {
  applyProfileAnswer,
  buildAnswerPayload,
  isQuestionVisible,
  panelsFor,
  parseAnswerRows,
  parseProfileQuestions,
  parseProfileSummaries,
  toggleMultiOption,
  validateProfileQuestions,
  type ProfileQuestion,
} from './additionalProfileForm'

const questions: ProfileQuestion[] = [
  {
    key: 'licensed',
    label: 'Licensed?',
    fieldType: 'single',
    required: true,
    order: 1,
    showWhen: null,
    options: [
      { key: 'yes', label: 'Yes', groupLabel: null, isOther: false, isExclusive: false },
      { key: 'no', label: 'No', groupLabel: null, isOther: false, isExclusive: false },
    ],
  },
  {
    key: 'license_number',
    label: 'License number',
    fieldType: 'text',
    required: true,
    order: 2,
    showWhen: { questionKey: 'licensed', optionKeys: ['yes'] },
    options: [],
  },
  {
    key: 'conditions',
    label: 'Conditions',
    fieldType: 'multi',
    required: true,
    order: 3,
    showWhen: null,
    options: [
      { key: 'asthma', label: 'Asthma', groupLabel: 'Respiratory', isOther: false, isExclusive: false },
      { key: 'none', label: 'None', groupLabel: null, isOther: false, isExclusive: true },
      { key: 'other', label: 'Other', groupLabel: null, isOther: true, isExclusive: false },
    ],
  },
]

const parsed = parseProfileQuestions({
  profile_type: 'healthcare',
  profile_label: 'Healthcare Professional Panel',
  questions: [
    {
      id: 23,
      question_key: 'licensed',
      question_text: 'Are you currently licensed?',
      field_type: 'single',
      is_required: 1,
      display_order: 2,
      selection: 'one',
      show_when: null,
      options: [{ option_key: 'yes', option_text: 'Yes', group_label: null, is_other: 0, is_exclusive: 0 }],
    },
    {
      id: 24,
      question_key: 'license_number',
      question_text: 'License number',
      field_type: 'text',
      is_required: 1,
      display_order: 1,
      selection: 'text',
      show_when: { question_key: 'licensed', option_keys: ['yes'] },
      options: [],
    },
  ],
})

assert.ok(parsed)
assert.deepEqual(parsed.questions.map((question) => question.key), ['license_number', 'licensed'])
assert.equal(parsed.questions[0]?.showWhen?.optionKeys[0], 'yes')

let answers = applyProfileAnswer(questions, {}, 'licensed', 'no')
assert.equal(isQuestionVisible(questions[1], answers), false)
assert.equal(Object.keys(validateProfileQuestions(questions, answers)).length, 1)

answers = applyProfileAnswer(questions, answers, 'licensed', 'yes')
assert.equal(isQuestionVisible(questions[1], answers), true)
assert.ok(validateProfileQuestions(questions, answers)['q-license_number'])
answers = applyProfileAnswer(questions, answers, 'license_number', 'AB-1')
answers = toggleMultiOption(questions, answers, questions[2], 'asthma')
answers = toggleMultiOption(questions, answers, questions[2], 'none')
assert.deepEqual(answers.conditions, ['none'])
answers = toggleMultiOption(questions, answers, questions[2], 'other')
answers = applyProfileAnswer(questions, answers, 'conditions__other', 'Migraine')
assert.deepEqual(buildAnswerPayload(questions, answers), [
  { question_key: 'licensed', option_key: 'yes' },
  { question_key: 'license_number', answer_text: 'AB-1' },
  { question_key: 'conditions', option_keys: ['other'], answer_text: 'Migraine' },
])

assert.deepEqual(
  parseAnswerRows([
    { question_key: 'conditions', option_key: 'asthma' },
    { question_key: 'conditions', option_key: 'gout' },
    { question_key: 'specialist_type', answer_text: 'Cardiologist' },
  ]),
  { conditions: ['asthma', 'gout'], specialist_type: 'Cardiologist' },
)

assert.deepEqual(parseProfileSummaries({ profiles: [{ id: '4', profile_type: 'patient', created_at: '2026-01-01' }] }), [
  { id: 4, kind: 'patient', createdAt: '2026-01-01' },
])

const panels = panelsFor('patient', [
  { ...questions[2], key: 'conditions', order: 1 },
  { ...questions[0], key: 'future_question', order: 2, label: 'Future question', showWhen: null },
])
assert.ok(panels.some((panel) => panel.keys.includes('conditions')))
assert.ok(panels.some((panel) => panel.id === 'more' && panel.keys.includes('future_question')))

const response = await fetch('https://intensityresearch.com/intensityapi/profile-questions?profile_type=patient')
const body = (await response.json()) as { data?: unknown }
const live = parseProfileQuestions(body.data)
assert.ok(live)
assert.ok(live.questions.some((question) => question.key === 'conditions' && question.fieldType === 'multi'))
assert.ok(live.questions.some((question) => question.showWhen?.questionKey === 'managing_professional'))
const livePanels = panelsFor('patient', live.questions)
const covered = new Set(livePanels.flatMap((panel) => panel.keys))
assert.equal(covered.size, live.questions.length)

console.log('additional profile form tests passed')
