import { useEffect, useSyncExternalStore } from 'react'
import { PROFILE_SECTION_IDS } from '@/content/profileQuestions'
import type { AdditionalProfileKind } from '@/content/questionnaires'
import { useAuth } from '@/hooks/useAuth'
import { industryAnswerLabel, panelsForIndustryLabel } from '@/lib/industryPanels'
import { answersToFormValues, buildProfileSections } from '@/lib/profileQuestions'
import { onboardingService } from '@/services/onboarding.service'

export type IndustryEligibilityState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; label: string; eligible: AdditionalProfileKind[] }

interface Snapshot {
  userId: number | null
  state: IndustryEligibilityState
}

let snapshot: Snapshot = { userId: null, state: { status: 'idle' } }
let generation = 0
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

const serverSnapshot: Snapshot = { userId: null, state: { status: 'idle' } }

async function loadIndustry(userId: number, force = false) {
  if (!force && snapshot.userId === userId && (snapshot.state.status === 'ready' || snapshot.state.status === 'loading')) return
  const ticket = ++generation
  snapshot = { userId, state: { status: 'loading' } }
  emit()
  try {
    const [questions, saved] = await Promise.all([onboardingService.getQuestions(), onboardingService.getAnswers()])
    if (ticket !== generation) return
    const sections = buildProfileSections(questions.steps)
    const profileQuestions = PROFILE_SECTION_IDS.flatMap((id) => sections[id])
    const label = industryAnswerLabel(sections, answersToFormValues(saved.answers, profileQuestions))
    snapshot = { userId, state: { status: 'ready', label, eligible: panelsForIndustryLabel(label) } }
    emit()
  } catch {
    if (ticket !== generation) return
    snapshot = { userId, state: { status: 'error' } }
    emit()
  }
}

/** Reload About You after an industry answer is saved so every profile surface updates together. */
export function invalidateIndustryEligibility() {
  if (snapshot.userId == null) return
  void loadIndustry(snapshot.userId, true)
}

export function useIndustryEligibility() {
  const { user, ready } = useAuth()
  const userId = user?.id ?? null
  const current = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot)

  useEffect(() => {
    if (!ready) return
    if (userId == null) {
      generation += 1
      if (snapshot.userId != null || snapshot.state.status !== 'idle') {
        snapshot = { userId: null, state: { status: 'idle' } }
        emit()
      }
      return
    }
    void loadIndustry(userId)
  }, [ready, userId])

  if (!ready || userId == null) return { status: 'idle' } as const
  if (current.userId !== userId) return { status: 'loading' } as const
  return current.state
}
