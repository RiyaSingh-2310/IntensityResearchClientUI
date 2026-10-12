import type { AdditionalProfileKind } from '@/content/questionnaires'
import { PROFILE_SECTION_IDS } from '@/content/profileQuestions'
import { normalizeLabel, optionLabel, type ProfileSections } from '@/lib/profileQuestions'

export const INDUSTRY_QUESTION_LABEL = 'Which industry does your organization primarily operate in?'

const HEALTHCARE_INDUSTRY = normalizeLabel('Healthcare & Pharmaceuticals')

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
  return isHealthcarePharmaceuticals(label) ? ['b2b', 'healthcare', 'patient'] : ['b2b', 'patient']
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
  return typeof value === 'string' && value ? optionLabel(question, value) : ''
}

