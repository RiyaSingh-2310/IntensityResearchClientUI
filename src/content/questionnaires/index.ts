import { aboutYouQuestions } from './aboutYou'
import { b2bQuestions, healthcareQuestions, patientQuestions } from './panels'
import type { QuestionnaireProfile, QuestionnaireQuestion } from './types'

export type { QuestionnaireAnswers, QuestionnaireFieldType, QuestionnaireProfile, QuestionnaireQuestion } from './types'

export const questionnaireByProfile: Record<Exclude<QuestionnaireProfile, 'about-you'> | 'about-you', QuestionnaireQuestion[]> = {
  'about-you': aboutYouQuestions,
  b2b: b2bQuestions,
  healthcare: healthcareQuestions,
  patient: patientQuestions,
}

export const additionalProfileKinds = ['b2b', 'healthcare', 'patient'] as const
export type AdditionalProfileKind = (typeof additionalProfileKinds)[number]

export const additionalProfileLabels: Record<AdditionalProfileKind, string> = {
  b2b: 'B2B Panel',
  healthcare: 'Healthcare Professional Panel',
  patient: 'Patient Panel',
}

export const additionalProfileSummaries: Record<AdditionalProfileKind, string> = {
  b2b: 'Share your professional background, job role, industry, and business experience.',
  healthcare: 'Share your healthcare qualifications, professional role, specialty, and work experience.',
  patient: 'Share your health experiences, patient journey, and relevant medical background.',
}

export const additionalProfileCompleteLabel: Record<AdditionalProfileKind, string> = {
  b2b: 'Complete B2B Profile',
  healthcare: 'Complete Healthcare Profile',
  patient: 'Complete Patient Profile',
}

/** Prefer B2B when it can still be created. Never returns a kind that is not in `available`. */
export function defaultAdditionalProfileKind(available: readonly AdditionalProfileKind[]): AdditionalProfileKind | null {
  if (available.includes('b2b')) return 'b2b'
  return available[0] ?? null
}

export const additionalProfileIntro: Record<AdditionalProfileKind, { title: string; description: string }> = {
  healthcare: {
    title: 'Healthcare Research Profile',
    description:
      'Tell us about your healthcare background, professional role, and experience in the healthcare industry to help us match you with relevant research opportunities.',
  },
  patient: {
    title: 'Patient Research Profile',
    description:
      'Share information about your health experiences and patient journey to help us understand patient perspectives and connect you with relevant research studies.',
  },
  b2b: {
    title: 'B2B Research Profile',
    description:
      'Share information about your professional role, department, industry, and business experience to help us match you with relevant business research studies.',
  },
}

export function questionsFor(profile: QuestionnaireProfile) {
  return [...questionnaireByProfile[profile]].sort((a, b) => a.order - b.order)
}

export { questionPanels, type QuestionPanel } from './groups'

export function visibleQuestions(questions: QuestionnaireQuestion[], answers: Record<string, string>) {
  return questions.filter((question) => !question.showIf || answers[question.showIf.key] === question.showIf.equals)
}
