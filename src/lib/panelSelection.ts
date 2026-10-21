import { additionalProfileKinds, type AdditionalProfileKind } from '@/content/questionnaires'
import { normalizeLabel } from '@/lib/profileQuestions'

const KEY = 'ir.panel-selection.v1.'
const LOGIN_PROMPT_KEY = 'ir.panel-prompt-login'

export interface PanelSelectionRecord {
  industry: string
  kinds: AdditionalProfileKind[]
}

export type PanelPrompt =
  | { status: 'complete' }
  | { status: 'missing-industry' }
  | { status: 'choose'; options: AdditionalProfileKind[] }
  | { status: 'retry'; options: AdditionalProfileKind[]; pending: AdditionalProfileKind[] }

function isKind(value: unknown): value is AdditionalProfileKind {
  return additionalProfileKinds.includes(value as AdditionalProfileKind)
}

export function readPanelSelection(userId: number): PanelSelectionRecord | null {
  try {
    const raw = localStorage.getItem(`${KEY}${userId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { industry?: unknown; kinds?: unknown }
    if (typeof parsed.industry !== 'string') return null
    const kinds = Array.isArray(parsed.kinds) ? parsed.kinds.filter(isKind) : []
    return { industry: parsed.industry, kinds }
  } catch {
    return null
  }
}

export function savePanelSelection(userId: number, record: PanelSelectionRecord) {
  const kinds = additionalProfileKinds.filter((kind) => record.kinds.includes(kind))
  localStorage.setItem(`${KEY}${userId}`, JSON.stringify({ industry: record.industry, kinds } satisfies PanelSelectionRecord))
}

/** Remember that this sign-in should show the panel modal once industry data is ready. */
export function markPanelPromptAfterLogin(userId: number) {
  sessionStorage.setItem(LOGIN_PROMPT_KEY, `${userId}:${Date.now()}`)
}

export function panelPromptLoginToken(userId: number) {
  const raw = sessionStorage.getItem(LOGIN_PROMPT_KEY)
  if (!raw) return null
  const id = raw.split(':')[0]
  return id === String(userId) ? raw : null
}

export function clearPanelPromptAfterLogin() {
  sessionStorage.removeItem(LOGIN_PROMPT_KEY)
}

/** First eligible profile, unless a pending choice is still available. Never returns an ineligible kind. */
export function initialPanelSelection(
  options: readonly AdditionalProfileKind[],
  pending: readonly AdditionalProfileKind[] = [],
): AdditionalProfileKind | null {
  const allowed = new Set(options)
  const chosen = pending.find((kind) => allowed.has(kind))
  return chosen ?? options[0] ?? null
}

/**
 * Decides whether the post-login panel modal is still required.
 * Options never include a profile that is ineligible or already created.
 * Choosing none is a completed opt-out.
 * Any other uncreated eligible profile is offered on the next sign-in, one at a time.
 * The Add Profile screen still offers any eligible profile that has not been created.
 */
export function panelPromptFor(input: {
  industryLabel: string
  eligible: readonly AdditionalProfileKind[]
  created: readonly AdditionalProfileKind[]
  saved: PanelSelectionRecord | null
}): PanelPrompt {
  const industryLabel = input.industryLabel.trim()
  if (!industryLabel || input.eligible.length === 0) return { status: 'missing-industry' }

  const available = input.eligible.filter((kind) => !input.created.includes(kind))
  const sameIndustry = input.saved ? normalizeLabel(input.saved.industry) === normalizeLabel(industryLabel) : false
  if (input.saved && sameIndustry && input.saved.kinds.length === 0) return { status: 'complete' }
  if (available.length === 0) return { status: 'complete' }

  if (input.saved && sameIndustry) {
    const pending = input.saved.kinds.filter((kind) => available.includes(kind))
    if (pending.length) return { status: 'retry', options: available, pending }
  }

  return { status: 'choose', options: available }
}
