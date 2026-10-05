import type { AnswersResponse, DropdownOption, OnboardingAnswerInput, OnboardingStepGroup, QuestionsResponse } from '@/types/api'
import { flattenQuestions } from '@/lib/apiMap'
import { apiRequest } from './http'

export const onboardingService = {
  getQuestions(stepNo?: number) {
    const suffix = stepNo != null ? `?step_no=${stepNo}` : ''
    return apiRequest<QuestionsResponse | OnboardingStepGroup[]>(`/questions${suffix}`, { auth: false }).then((data) => {
      const steps = Array.isArray(data) ? data : data.steps ?? []
      return { steps, questions: flattenQuestions(steps) }
    })
  },
  getDropdowns(category?: string) {
    const suffix = category ? `?category=${encodeURIComponent(category)}` : ''
    return apiRequest<unknown>(`/dropdowns${suffix}`, { auth: false }).then((data) => {
      if (Array.isArray(data)) return data as DropdownOption[]
      if (data && typeof data === 'object') {
        const record = data as Record<string, unknown>
        if (Array.isArray(record.options)) return record.options as DropdownOption[]
        if (Array.isArray(record.items)) return record.items as DropdownOption[]
      }
      return [] as DropdownOption[]
    })
  },
  getAnswers() {
    return apiRequest<AnswersResponse>('/onboarding/answers')
  },
  saveAnswers(answers: OnboardingAnswerInput[]) {
    return apiRequest<AnswersResponse>('/onboarding/answers', {
      method: 'POST',
      body: { answers },
    })
  },
}
