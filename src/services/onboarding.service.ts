import type { AnswersResponse, DropdownOption, OnboardingAnswer, OnboardingAnswerInput, OnboardingQuestion, OnboardingStepGroup, QuestionsResponse } from '@/types/api'
import { flattenQuestions } from '@/lib/apiMap'
import { apiRequest } from './http'

function asOptions(value: unknown): DropdownOption[] {
  return Array.isArray(value) ? (value as DropdownOption[]) : []
}

/** GET /dropdowns returns `{ categories }` for the full list and `{ items }` when `category` is set. */
export function dropdownsByCategory(data: unknown): Record<string, DropdownOption[]> {
  if (!data || typeof data !== 'object') return {}
  const record = data as Record<string, unknown>
  const categories = record.categories
  if (categories && typeof categories === 'object' && !Array.isArray(categories)) {
    const map: Record<string, DropdownOption[]> = {}
    for (const [category, items] of Object.entries(categories)) map[category] = asOptions(items)
    return map
  }
  const items = asOptions(record.items ?? record.options ?? (Array.isArray(data) ? data : undefined))
  return items.length ? { '*': items } : {}
}

function optionsFor(map: Record<string, DropdownOption[]>, category: string | null | undefined) {
  if (!category || category === 'None') return []
  return map[category] ?? map[category.toLowerCase()] ?? []
}

function withDropdownOptions(steps: OnboardingStepGroup[], map: Record<string, DropdownOption[]>) {
  return steps.map((step) => ({
    ...step,
    questions: (step.questions ?? []).map((question) => {
      if (question.options?.length) return question
      const options = optionsFor(map, question.dropdown_category)
      return options.length ? { ...question, options } : question
    }),
  }))
}

function needsDropdowns(steps: OnboardingStepGroup[]) {
  return steps.some((step) =>
    (step.questions ?? []).some(
      (question: OnboardingQuestion) =>
        Boolean(question.dropdown_category && question.dropdown_category !== 'None' && !question.options?.length),
    ),
  )
}

function unwrapAnswers(data: unknown): AnswersResponse {
  if (Array.isArray(data)) return { answers: data as OnboardingAnswer[] } as unknown as AnswersResponse
  if (!data || typeof data !== 'object') return { answers: [] } as unknown as AnswersResponse
  const record = data as AnswersResponse & { items?: OnboardingAnswer[] }
  const answers = Array.isArray(record.answers) ? record.answers : Array.isArray(record.items) ? record.items : []
  return { ...record, answers }
}

export const onboardingService = {
  async getQuestions(stepNo?: number) {
    const suffix = stepNo != null ? `?step_no=${stepNo}` : ''
    const data = await apiRequest<QuestionsResponse | OnboardingStepGroup[]>(`/questions${suffix}`, { auth: false })
    let steps = Array.isArray(data) ? data : data.steps ?? []
    if (needsDropdowns(steps)) {
      const dropdowns = await apiRequest<unknown>('/dropdowns', { auth: false }).catch(() => null)
      if (dropdowns) steps = withDropdownOptions(steps, dropdownsByCategory(dropdowns))
    }
    return { steps, questions: flattenQuestions(steps) }
  },
  getDropdowns(category?: string) {
    const suffix = category ? `?category=${encodeURIComponent(category)}` : ''
    return apiRequest<unknown>(`/dropdowns${suffix}`, { auth: false }).then((data) => {
      const map = dropdownsByCategory(data)
      if (category) return map[category] ?? map['*'] ?? []
      return Object.values(map).flat()
    })
  },
  getAnswers() {
    return apiRequest<unknown>('/onboarding/answers').then(unwrapAnswers)
  },
  saveAnswers(answers: OnboardingAnswerInput[]) {
    return apiRequest<AnswersResponse>('/onboarding/answers', {
      method: 'POST',
      body: { answers },
    })
  },
}
