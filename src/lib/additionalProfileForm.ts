import { questionPanels, type QuestionPanel } from '@/content/questionnaires/groups'
import { additionalProfileKinds, type AdditionalProfileKind } from '@/content/questionnaires'
import { asNumber } from './utils'

export interface ProfileQuestionOption {
  key: string
  label: string
  groupLabel: string | null
  isOther: boolean
  isExclusive: boolean
}

export interface ProfileShowWhen {
  questionKey: string
  optionKeys: string[]
}

export interface ProfileQuestion {
  key: string
  label: string
  fieldType: 'single' | 'multi' | 'text'
  required: boolean
  order: number
  showWhen: ProfileShowWhen | null
  options: ProfileQuestionOption[]
}

export interface ProfileQuestionSet {
  profileType: AdditionalProfileKind
  profileLabel: string
  questions: ProfileQuestion[]
}

/** Form values keyed by question_key. Multi-select stores option keys. Other text uses `${key}__other`. */
export type AdditionalAnswerMap = Record<string, string | string[]>

export interface AdditionalProfileAnswerInput {
  question_key: string
  option_key?: string
  option_keys?: string[]
  answer_text?: string
}

const OTHER_SUFFIX = '__other'

export function otherAnswerKey(questionKey: string) {
  return `${questionKey}${OTHER_SUFFIX}`
}

export function questionErrorKey(questionKey: string) {
  return `q-${questionKey}`
}

function flag(value: unknown) {
  return value === true || value === 1 || value === '1' || value === 'true'
}

function text(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function isKind(value: string): value is AdditionalProfileKind {
  return (additionalProfileKinds as readonly string[]).includes(value)
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

function parseShowWhen(value: unknown): ProfileShowWhen | null {
  const record = typeof value === 'string' ? asRecord(safeJson(value)) : asRecord(value)
  if (!record) return null
  const questionKey = text(record.question_key || record.questionKey).trim()
  const rawKeys = record.option_keys ?? record.optionKeys
  const optionKeys = Array.isArray(rawKeys) ? rawKeys.map((item) => text(item).trim()).filter(Boolean) : []
  if (!questionKey || !optionKeys.length) return null
  return { questionKey, optionKeys }
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function parseOption(value: unknown): ProfileQuestionOption | null {
  const record = asRecord(value)
  if (!record) return null
  const key = text(record.option_key || record.key).trim()
  const label = text(record.option_text || record.label || record.name).trim()
  if (!key || !label) return null
  const group = text(record.group_label).trim()
  return {
    key,
    label,
    groupLabel: group || null,
    isOther: flag(record.is_other),
    isExclusive: flag(record.is_exclusive),
  }
}

function parseQuestion(value: unknown): ProfileQuestion | null {
  const record = asRecord(value)
  if (!record) return null
  const key = text(record.question_key).trim()
  const label = text(record.question_text).trim()
  if (!key || !label) return null
  const field = text(record.field_type || record.selection).toLowerCase()
  const fieldType: ProfileQuestion['fieldType'] = field === 'multi' || field === 'many' ? 'multi' : field === 'text' ? 'text' : 'single'
  const options = Array.isArray(record.options) ? record.options.map(parseOption).filter((item): item is ProfileQuestionOption => Boolean(item)) : []
  return {
    key,
    label,
    fieldType,
    required: flag(record.is_required),
    order: asNumber(record.display_order, 0),
    showWhen: parseShowWhen(record.show_when),
    options,
  }
}

export function parseProfileQuestions(payload: unknown): ProfileQuestionSet | null {
  const record = asRecord(payload)
  const source = record && (record.questions || record.profile_type) ? record : asRecord(record?.data) ?? record
  if (!source) return null
  const profileType = text(source.profile_type).trim().toLowerCase()
  if (!isKind(profileType)) return null
  const questions = (Array.isArray(source.questions) ? source.questions : [])
    .map(parseQuestion)
    .filter((item): item is ProfileQuestion => Boolean(item))
    .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))
  return {
    profileType,
    profileLabel: text(source.profile_label).trim() || profileType,
    questions,
  }
}

export function selectedKeys(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.filter(Boolean)
  return value ? [value] : []
}

export function isQuestionVisible(question: ProfileQuestion, answers: AdditionalAnswerMap) {
  if (!question.showWhen) return true
  const selected = selectedKeys(answers[question.showWhen.questionKey])
  return question.showWhen.optionKeys.some((key) => selected.includes(key))
}

export function visibleProfileQuestions(questions: ProfileQuestion[], answers: AdditionalAnswerMap) {
  return questions.filter((question) => isQuestionVisible(question, answers))
}

function otherOption(question: ProfileQuestion) {
  return question.options.find((option) => option.isOther)
}

export function applyProfileAnswer(questions: ProfileQuestion[], answers: AdditionalAnswerMap, key: string, value: string | string[]) {
  const next: AdditionalAnswerMap = { ...answers, [key]: value }
  const parentKey = key.endsWith(OTHER_SUFFIX) ? key.slice(0, -OTHER_SUFFIX.length) : key
  const question = questions.find((item) => item.key === parentKey)
  if (question && !key.endsWith(OTHER_SUFFIX)) {
    const other = otherOption(question)
    if (!other || !selectedKeys(value).includes(other.key)) delete next[otherAnswerKey(question.key)]
  }
  for (const item of questions) {
    if (!isQuestionVisible(item, next)) {
      delete next[item.key]
      delete next[otherAnswerKey(item.key)]
    }
  }
  return next
}

export function toggleMultiOption(questions: ProfileQuestion[], answers: AdditionalAnswerMap, question: ProfileQuestion, optionKey: string) {
  const current = selectedKeys(answers[question.key])
  const option = question.options.find((item) => item.key === optionKey)
  let next: string[]
  if (current.includes(optionKey)) next = current.filter((key) => key !== optionKey)
  else if (option?.isExclusive) next = [optionKey]
  else {
    const exclusive = new Set(question.options.filter((item) => item.isExclusive).map((item) => item.key))
    next = [...current.filter((key) => !exclusive.has(key)), optionKey]
  }
  return applyProfileAnswer(questions, answers, question.key, next)
}

export function validateProfileQuestions(questions: ProfileQuestion[], answers: AdditionalAnswerMap) {
  const errors: Record<string, string> = {}
  for (const question of visibleProfileQuestions(questions, answers)) {
    const value = answers[question.key]
    const other = text(answers[otherAnswerKey(question.key)]).trim()
    const chosen = question.fieldType === 'text' ? text(value).trim() : selectedKeys(value)
    const empty = question.fieldType === 'text' ? !chosen : chosen.length === 0
    if (question.required && empty) {
      errors[questionErrorKey(question.key)] =
        question.fieldType === 'text' ? 'Please answer this question.' : question.fieldType === 'multi' ? 'Please select at least one option.' : 'Please select an option.'
      continue
    }
    const otherSelected = otherOption(question)
    if (otherSelected && selectedKeys(value).includes(otherSelected.key) && !other) {
      errors[questionErrorKey(question.key)] = 'Please specify your answer.'
    }
  }
  return errors
}

export function buildAnswerPayload(questions: ProfileQuestion[], answers: AdditionalAnswerMap): AdditionalProfileAnswerInput[] {
  const payload: AdditionalProfileAnswerInput[] = []
  for (const question of visibleProfileQuestions(questions, answers)) {
    const other = text(answers[otherAnswerKey(question.key)]).trim()
    if (question.fieldType === 'text') {
      const answer = text(answers[question.key]).trim()
      if (answer) payload.push({ question_key: question.key, answer_text: answer })
      continue
    }
    const keys = selectedKeys(answers[question.key])
    if (!keys.length) continue
    const otherSelected = otherOption(question)
    const includeOther = Boolean(otherSelected && keys.includes(otherSelected.key) && other)
    if (question.fieldType === 'multi') {
      payload.push({
        question_key: question.key,
        option_keys: keys,
        ...(includeOther ? { answer_text: other } : {}),
      })
    } else {
      payload.push({
        question_key: question.key,
        option_key: keys[0],
        ...(includeOther ? { answer_text: other } : {}),
      })
    }
  }
  return payload
}

function optionKeyFrom(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') return text(value).trim()
  const record = asRecord(value)
  if (!record) return ''
  return text(record.option_key || record.key).trim()
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(optionKeyFrom).filter(Boolean)
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    const parsed = safeJson(value)
    if (Array.isArray(parsed)) return parsed.map(optionKeyFrom).filter(Boolean)
  }
  const record = asRecord(value)
  if (record) {
    const nested = stringList(record.option_keys ?? record.option_key ?? record.key)
    if (nested.length) return nested
  }
  const single = optionKeyFrom(value)
  return single ? [single] : []
}

export function parseAnswerRows(rows: unknown): AdditionalAnswerMap {
  if (!Array.isArray(rows)) return {}
  const answers: AdditionalAnswerMap = {}
  const multi = new Map<string, string[]>()
  for (const row of rows) {
    const record = asRecord(row)
    if (!record) continue
    const key = text(record.question_key).trim()
    if (!key) continue
    const optionKeys = stringList(record.option_keys)
    const optionKey = text(record.option_key).trim()
    const answerText = text(record.answer_text).trim()
    if (optionKeys.length) {
      multi.set(key, [...(multi.get(key) ?? []), ...optionKeys])
      if (answerText) answers[otherAnswerKey(key)] = answerText
      continue
    }
    if (optionKey) {
      multi.set(key, [...(multi.get(key) ?? []), optionKey])
      if (answerText) answers[otherAnswerKey(key)] = answerText
      continue
    }
    if (answerText) answers[key] = answerText
  }
  for (const [key, keys] of multi) {
    const unique = Array.from(new Set(keys))
    answers[key] = unique.length > 1 ? unique : unique[0] ?? ''
  }
  return answers
}

export function displayProfileAnswer(question: ProfileQuestion, answers: AdditionalAnswerMap) {
  if (question.fieldType === 'text') return text(answers[question.key]).trim()
  const labels = selectedKeys(answers[question.key]).map((key) => {
    const option = question.options.find((item) => item.key === key)
    if (option?.isOther) {
      const other = text(answers[otherAnswerKey(question.key)]).trim()
      return other || option.label
    }
    return option?.label ?? key
  })
  return labels.filter(Boolean).join(', ')
}

export function panelsFor(kind: AdditionalProfileKind, questions: ProfileQuestion[]): QuestionPanel[] {
  const byKey = new Map(questions.map((question) => [question.key, question]))
  const used = new Set<string>()
  const panels = questionPanels[kind]
    .map((panel) => {
      const keys = panel.keys
        .filter((key) => byKey.has(key))
        .sort((a, b) => (byKey.get(a)?.order ?? 0) - (byKey.get(b)?.order ?? 0))
      keys.forEach((key) => used.add(key))
      return { ...panel, keys }
    })
    .filter((panel) => panel.keys.length)
  const rest = questions.filter((question) => !used.has(question.key)).map((question) => question.key)
  if (rest.length) {
    panels.push({
      id: 'more',
      title: 'Additional questions',
      description: 'Further questions returned for this profile.',
      keys: rest,
    })
  }
  return panels
}

export function questionsForPanel(questions: ProfileQuestion[], keys: string[]) {
  const byKey = new Map(questions.map((question) => [question.key, question]))
  return keys.map((key) => byKey.get(key)).filter((question): question is ProfileQuestion => Boolean(question))
}

export interface AdditionalProfileSummary {
  id: number
  kind: AdditionalProfileKind
  createdAt: string
}

function profileKind(value: unknown): AdditionalProfileKind | null {
  const kind = text(value).trim().toLowerCase()
  return isKind(kind) ? kind : null
}

export function parseProfileSummaries(payload: unknown): AdditionalProfileSummary[] {
  const record = asRecord(payload)
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(record?.profiles)
      ? record.profiles
      : Array.isArray(record?.items)
        ? record.items
        : Array.isArray(record?.additional_profiles)
          ? record.additional_profiles
          : []
  const summaries: AdditionalProfileSummary[] = []
  for (const item of list) {
    const row = asRecord(item)
    if (!row) continue
    const kind = profileKind(row.profile_type ?? row.kind)
    const id = asNumber(row.id)
    if (!kind || !id || summaries.some((saved) => saved.kind === kind)) continue
    summaries.push({
      id,
      kind,
      createdAt: text(row.created_at || row.createdAt).trim(),
    })
  }
  return summaries
}

function rowsFromAnswers(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value
  const record = asRecord(value)
  if (!record) return null
  if (text(record.question_key).trim()) return [record]
  const rows: unknown[] = []
  for (const [key, answer] of Object.entries(record)) {
    if (key === 'profile_type' || key === 'profile_label' || key === 'id') continue
    const nested = asRecord(answer)
    if (typeof answer === 'string' || Array.isArray(answer)) {
      rows.push({ question_key: key, answer_text: typeof answer === 'string' ? answer : undefined, option_keys: Array.isArray(answer) ? answer : undefined })
      continue
    }
    if (nested) rows.push({ question_key: nested.question_key || key, ...nested })
  }
  return rows.length ? rows : null
}

function rowsFromQuestions(value: unknown): unknown[] {
  if (!Array.isArray(value)) return []
  const rows: unknown[] = []
  for (const item of value) {
    const question = asRecord(item)
    if (!question) continue
    const key = text(question.question_key).trim()
    if (!key) continue
    const nested = asRecord(question.answer) ?? asRecord(question.selected) ?? asRecord(question.response)
    const source = nested ?? question
    const hasAnswer = source.option_key || source.option_keys || source.answer_text || source.selected_option_keys
    if (!hasAnswer) continue
    rows.push({
      question_key: key,
      option_key: source.option_key,
      option_keys: source.option_keys ?? source.selected_option_keys,
      answer_text: source.answer_text,
    })
  }
  return rows
}

export function extractAnswerRows(payload: unknown): unknown[] {
  const record = asRecord(payload)
  if (!record) return Array.isArray(payload) ? payload : []
  const direct = rowsFromAnswers(record.answers) ?? rowsFromAnswers(asRecord(record.profile)?.answers)
  if (direct?.length) return direct
  const embedded = rowsFromQuestions(record.questions ?? asRecord(record.profile)?.questions)
  return embedded
}

export function readProfileId(payload: unknown, kind: AdditionalProfileKind) {
  const record = asRecord(payload)
  const direct = asNumber(record?.id)
  if (direct) return direct
  const nested = asRecord(record?.profile)
  const nestedId = asNumber(nested?.id)
  if (nestedId) return nestedId
  return parseProfileSummaries(payload).find((item) => item.kind === kind)?.id ?? 0
}

export function readCreatedAt(payload: unknown) {
  const record = asRecord(payload)
  return text(record?.created_at || record?.createdAt || asRecord(record?.profile)?.created_at).trim()
}
