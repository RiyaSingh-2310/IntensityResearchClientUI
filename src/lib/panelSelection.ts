import { additionalProfileKinds, type AdditionalProfileKind } from '@/content/questionnaires'
import { normalizeLabel } from '@/lib/profileQuestions'

const KEY = 'ir.panel-selection.v1.'

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

/**
 * Decides whether the post-login panel modal is still required.
 * A saved choice is complete when every chosen panel exists on the account.
 * Choosing none is a completed opt-out. An industry change asks again.
 * Accounts that already have an eligible panel, and no saved choice, are left alone.
 */
export function panelPromptFor(input: {
  industryLabel: string
  eligible: readonly AdditionalProfileKind[]
  created: readonly AdditionalProfileKind[]
  saved: PanelSelectionRecord | null
}): PanelPrompt {
  const industryLabel = input.industryLabel.trim()
  if (!industryLabel || input.eligible.length === 0) return { status: 'missing-industry' }

  const sameIndustry = input.saved ? normalizeLabel(input.saved.industry) === normalizeLabel(industryLabel) : false
  if (input.saved && sameIndustry) {
    const pending = input.saved.kinds.filter((kind) => input.eligible.includes(kind) && !input.created.includes(kind))
    if (pending.length === 0) return { status: 'complete' }
    return { status: 'retry', options: [...input.eligible], pending }
  }
  if (input.saved && !sameIndustry) return { status: 'choose', options: [...input.eligible] }

  if (input.created.some((kind) => input.eligible.includes(kind))) return { status: 'complete' }
  return { status: 'choose', options: [...input.eligible] }
}
