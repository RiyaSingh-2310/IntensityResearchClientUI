import type { OnboardingAnswerInput } from '@/types/api'

const KEY = 'ir.pending.onboarding'

interface PendingOnboarding {
  email: string
  answers: OnboardingAnswerInput[]
}

export function savePendingOnboarding(email: string, answers: OnboardingAnswerInput[]) {
  if (!email || !answers.length) return
  sessionStorage.setItem(KEY, JSON.stringify({ email: email.trim().toLowerCase(), answers } satisfies PendingOnboarding))
}

export function takePendingOnboarding(email: string): OnboardingAnswerInput[] {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as PendingOnboarding
    if (parsed.email !== email.trim().toLowerCase()) return []
    sessionStorage.removeItem(KEY)
    return Array.isArray(parsed.answers) ? parsed.answers : []
  } catch {
    sessionStorage.removeItem(KEY)
    return []
  }
}
