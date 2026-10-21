import type { AdditionalProfileKind } from '@/content/questionnaires'
import { PROFILE_SECTION_IDS } from '@/content/profileQuestions'
import { normalizeLabel, optionLabel, type FormQuestion, type ProfileSections } from '@/lib/profileQuestions'

export const INDUSTRY_QUESTION_LABEL = 'Which industry does your organization primarily operate in?'

const HEALTHCARE_INDUSTRY = normalizeLabel('Healthcare & Pharmaceuticals')

/**
 * Additional profiles offered for a saved industry category.
 *
 * Healthcare & Pharmaceuticals, including sub-industries whose dropdown parent is that
 * category, may create B2B Panel, Healthcare Professional Panel, and Patient Panel.
 * Every other non-empty industry category may create B2B Panel and Patient Panel.
 * Verified categories include Financial Services, Technology & IT, and Consumer & Retail,
 * plus specialties such as Banking, IT services, and Education.
 * A missing industry answer is eligible for none of them.
 */
const HEALTHCARE_PANELS: AdditionalProfileKind[] = ['b2b', 'healthcare', 'patient']
const STANDARD_PANELS: AdditionalProfileKind[] = ['b2b', 'patient']

export function isIndustryQuestion(label: string) {
  return normalizeLabel(label) === normalizeLabel(INDUSTRY_QUESTION_LABEL)
}

/** Matches the industry option itself, after a leading list number such as "1. ". */
export function isHealthcarePharmaceuticals(label: string) {
  const withoutIndex = label.replace(/^\s*\d+\.\s*/, '')
  return normalizeLabel(withoutIndex) === HEALTHCARE_INDUSTRY
}

export function panelsForIndustryLabel(label: string): AdditionalProfileKind[] {
  if (!label.trim()) return []
  return isHealthcarePharmaceuticals(label) ? [...HEALTHCARE_PANELS] : [...STANDARD_PANELS]
}

/** Eligible profile types that have not been created yet. */
export function availableProfileKinds(industryLabel: string, created: readonly AdditionalProfileKind[]) {
  const createdSet = new Set(created)
  return panelsForIndustryLabel(industryLabel).filter((kind) => !createdSet.has(kind))
}

/**
 * Industry category used for eligibility.
 * A specialty such as Banking resolves to its parent, Financial Services.
 */
export function industryCategoryLabel(question: FormQuestion, value: string) {
  const normalized = normalizeLabel(value)
  const option =
    question.options.find((item) => item.value === value) ??
    question.options.find((item) => normalizeLabel(item.label) === normalized)
  if (!option) return question.options.length ? '' : optionLabel(question, value)
  if (option.parentValue) {
    const parent = question.options.find((item) => item.value === option.parentValue)
    if (parent) return parent.label
  }
  return option.label
}

export function findIndustryQuestion(sections: ProfileSections) {
  for (const sectionId of PROFILE_SECTION_IDS) {
    const match = sections[sectionId].find((question) => isIndustryQuestion(question.label))
    if (match) return match
  }
  return undefined
}

export function industryAnswerLabel(sections: ProfileSections, answers: Record<string, string | string[]>) {
  const question = findIndustryQuestion(sections)
  if (!question) return ''
  const value = answers[question.key]
  return typeof value === 'string' && value ? industryCategoryLabel(question, value) : ''
}

