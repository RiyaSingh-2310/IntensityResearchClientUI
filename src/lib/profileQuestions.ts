import {
  API_STEP_SECTIONS,
  consentBindings,
  PRIVACY_STEP_NO,
  type ConsentField,
  type ProfileFieldType,
  type ProfileSectionId,
} from '@/content/profileQuestions'
import type { OnboardingAnswer, OnboardingAnswerInput, OnboardingQuestion, OnboardingStepGroup } from '@/types/api'
import { findYesNoId, flattenQuestions } from './apiMap'
import { asNumber } from './utils'

export type AnswerValue = string | string[]
export type AnswerValues = Record<string, AnswerValue>

export interface FormOption {
  value: string
  label: string
}

export interface FormQuestion {
  /** Key in the answers map and in validation errors (`q-${key}`). Equals the API question id. */
  key: string
  section: ProfileSectionId
  label: string
  hint?: string
  fieldType: ProfileFieldType
  required: boolean
  options: FormOption[]
  maxLength?: number
  api: OnboardingQuestion
}

export type ProfileSections = Record<ProfileSectionId, FormQuestion[]>

export interface BuiltAnswers {
  answers: OnboardingAnswerInput[]
  /** Labels of answered fields the backend cannot store. */
  unmapped: string[]
}

/** `answer_text` column limit on the backend. */
const ANSWER_TEXT_MAX = 255

export function normalizeLabel(value: string) {
  return value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '')
}

function toFieldType(value: string | undefined): ProfileFieldType {
  if (value === 'dropdown' || value === 'checkbox' || value === 'text') return value
  return 'radio'
}

function fromApi(question: OnboardingQuestion, section: ProfileSectionId): FormQuestion {
  const fieldType = toFieldType(question.field_type)
  return {
    key: String(question.id),
    section,
    label: question.question_text,
    hint: fieldType === 'checkbox' ? 'Select all that apply' : undefined,
    fieldType,
    required: Boolean(asNumber(question.is_required)),
    options: question.options.map((option) => ({ value: String(option.id), label: option.name })),
    maxLength: fieldType === 'text' ? ANSWER_TEXT_MAX : undefined,
    api: question,
  }
}

export function buildProfileSections(steps: OnboardingStepGroup[]): ProfileSections {
  const sections: ProfileSections = { demographics: [], lifestyle: [], preferences: [] }
  for (const question of flattenQuestions(steps)) {
    const section = API_STEP_SECTIONS[question.step_no]
    if (section) sections[section].push(fromApi(question, section))
  }
  return sections
}

export function hasAnswer(value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim().length > 0
}

export function validateQuestions(questions: FormQuestion[], values: AnswerValues) {
  const errors: Record<string, string> = {}
  for (const question of questions) {
    const value = values[question.key]
    if (question.required && !hasAnswer(value)) {
      errors[`q-${question.key}`] =
        question.fieldType === 'checkbox'
          ? 'Please select at least one option.'
          : question.fieldType === 'text'
            ? 'Please fill in this field.'
            : 'Please select an option.'
      continue
    }
    if (question.fieldType === 'text' && typeof value === 'string' && question.maxLength && value.trim().length > question.maxLength) {
      errors[`q-${question.key}`] = `Please use ${question.maxLength} characters or fewer.`
    }
  }
  return errors
}

export function optionLabel(question: FormQuestion, value: string) {
  return question.options.find((option) => option.value === value)?.label ?? value
}

export function answerDisplay(question: FormQuestion, value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value.map((item) => optionLabel(question, item)).join(', ')
  if (!value) return ''
  return question.fieldType === 'text' ? value : optionLabel(question, value)
}

function answerFor(question: FormQuestion, value: AnswerValue): OnboardingAnswerInput | null {
  const questionId = asNumber(question.api.id)
  if (question.fieldType === 'text') {
    const text = typeof value === 'string' ? value.trim().slice(0, ANSWER_TEXT_MAX) : ''
    return text ? { question_id: questionId, answer_text: text } : null
  }
  const multiple = Array.isArray(value)
  const ids = (multiple ? value : [value]).map((item) => asNumber(item)).filter(Boolean)
  if (!ids.length) return null
  return multiple ? { question_id: questionId, answer_ref_ids: ids } : { question_id: questionId, answer_ref_id: ids[0] }
}

export function buildProfileAnswers(questions: FormQuestion[], values: AnswerValues): BuiltAnswers {
  const answers: OnboardingAnswerInput[] = []
  for (const question of questions) {
    const value = values[question.key]
    if (!hasAnswer(value)) continue
    const built = answerFor(question, value)
    if (built) answers.push(built)
  }
  return { answers, unmapped: [] }
}

export function answersToFormValues(answers: OnboardingAnswer[], questions: FormQuestion[]): AnswerValues {
  const values: AnswerValues = {}
  for (const question of questions) {
    const apiId = asNumber(question.api.id)
    const rows = answers.filter((answer) => asNumber(answer.question_id) === apiId)
    if (!rows.length) continue

    if (question.fieldType === 'text') {
      values[question.key] = rows[0]?.answer_text ?? ''
      continue
    }

    const selected = rows.map((row) => String(row.answer_ref_id ?? '')).filter((item) => item && item !== '0')
    if (!selected.length) continue
    values[question.key] = question.fieldType === 'checkbox' ? Array.from(new Set(selected)) : selected[0]
  }
  return values
}

export function privacyQuestions(steps: OnboardingStepGroup[]) {
  return flattenQuestions(steps).filter((question) => question.step_no === PRIVACY_STEP_NO)
}

export function findConsentQuestion(steps: OnboardingStepGroup[], field: ConsentField) {
  const binding = consentBindings.find((item) => item.field === field)
  if (!binding) return undefined
  const wanted = binding.texts.map(normalizeLabel)
  return privacyQuestions(steps).find(
    (item) => binding.ids.includes(item.id) || wanted.includes(normalizeLabel(item.question_text)),
  )
}

/** Each consent is stored as the Yes/No option on its Privacy-step question. */
export function buildConsentAnswers(steps: OnboardingStepGroup[], consents: Record<ConsentField, boolean>): BuiltAnswers {
  const result: BuiltAnswers = { answers: [], unmapped: [] }
  for (const binding of consentBindings) {
    const question = findConsentQuestion(steps, binding.field)
    if (!question) {
      if (consents[binding.field]) result.unmapped.push(binding.texts[0] ?? binding.field)
      continue
    }
    const optionId = findYesNoId(question, consents[binding.field])
    if (optionId != null) result.answers.push({ question_id: question.id, answer_ref_id: optionId })
  }
  return result
}
