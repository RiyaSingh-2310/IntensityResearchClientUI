import { useSyncExternalStore } from 'react'
import {
  additionalProfileKinds,
  type AdditionalProfileKind,
  type QuestionnaireAnswers,
} from '@/content/questionnaires'
import { useAuth } from '@/hooks/useAuth'

/**
 * Additional profiles are stored per account in this browser.
 * The Intensity API has no additional-profile endpoints, so this record is what
 * keeps completion and creation order after refresh, logout, and login.
 */
const STORAGE_PREFIX = 'ir.additional-profiles.v1.'

export interface StoredAdditionalProfile {
  kind: AdditionalProfileKind
  answers: QuestionnaireAnswers
  createdAt: string
}

export interface AdditionalProfileSnapshot {
  answers: Partial<Record<AdditionalProfileKind, QuestionnaireAnswers>>
  order: AdditionalProfileKind[]
  records: StoredAdditionalProfile[]
}

const EMPTY: AdditionalProfileSnapshot = { answers: {}, order: [], records: [] }

let boundUserId: string | null | undefined
let snapshot: AdditionalProfileSnapshot = EMPTY
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function isKind(value: unknown): value is AdditionalProfileKind {
  return additionalProfileKinds.includes(value as AdditionalProfileKind)
}

function answersFrom(value: unknown): QuestionnaireAnswers {
  if (!value || typeof value !== 'object') return {}
  const answers: QuestionnaireAnswers = {}
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === 'string') answers[key] = answer
  }
  return answers
}

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`
}

function readStored(userId: string): AdditionalProfileSnapshot {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw) as { profiles?: unknown }
    if (!Array.isArray(parsed.profiles)) return EMPTY
    const records: StoredAdditionalProfile[] = []
    for (const item of parsed.profiles) {
      if (!item || typeof item !== 'object') continue
      const record = item as { kind?: unknown; answers?: unknown; createdAt?: unknown }
      if (!isKind(record.kind)) continue
      if (records.some((saved) => saved.kind === record.kind)) continue
      records.push({
        kind: record.kind,
        answers: answersFrom(record.answers),
        createdAt: typeof record.createdAt === 'string' && record.createdAt ? record.createdAt : new Date(0).toISOString(),
      })
    }
    return snapshotFrom(records)
  } catch {
    return EMPTY
  }
}

function snapshotFrom(records: StoredAdditionalProfile[]): AdditionalProfileSnapshot {
  const answers: AdditionalProfileSnapshot['answers'] = {}
  for (const record of records) answers[record.kind] = record.answers
  return {
    answers,
    order: records.map((record) => record.kind),
    records,
  }
}

function writeStored(userId: string, records: StoredAdditionalProfile[]) {
  localStorage.setItem(storageKey(userId), JSON.stringify({ profiles: records }))
}

/** Bind the signed-in account. Does not notify listeners; call during render before reading the snapshot. */
export function bindAdditionalProfileUser(userId: string | null) {
  if (boundUserId === userId) return
  boundUserId = userId
  snapshot = userId ? readStored(userId) : EMPTY
}

function getSnapshot() {
  return snapshot
}

export function useSessionProfiles() {
  const { user } = useAuth()
  const id = user?.id != null ? String(user.id) : null
  bindAdditionalProfileUser(id)
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
}

export function sessionProfile(kind: AdditionalProfileKind) {
  return snapshot.answers[kind]
}

export function sessionProfileRecords() {
  return snapshot.records
}

export function missingSessionProfiles() {
  return additionalProfileKinds.filter((kind) => !snapshot.answers[kind])
}

function commit(records: StoredAdditionalProfile[]) {
  if (!boundUserId) {
    throw new Error('Sign in again before saving an additional profile.')
  }
  writeStored(boundUserId, records)
  snapshot = snapshotFrom(records)
  emit()
}

export function persistAdditionalProfile(kind: AdditionalProfileKind, answers: QuestionnaireAnswers, mode: 'create' | 'update') {
  const existing = snapshot.records.find((record) => record.kind === kind)
  if (mode === 'create' && existing) {
    throw new Error('This profile has already been created.')
  }
  if (mode === 'update' && !existing) {
    throw new Error('This profile has not been created yet.')
  }
  const nextRecord: StoredAdditionalProfile = {
    kind,
    answers: { ...answers },
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
  const records = existing
    ? snapshot.records.map((record) => (record.kind === kind ? nextRecord : record))
    : [...snapshot.records, nextRecord]
  commit(records)
  return nextRecord
}

export function replaceAdditionalProfiles(records: StoredAdditionalProfile[]) {
  const unique: StoredAdditionalProfile[] = []
  for (const record of records) {
    if (!isKind(record.kind) || unique.some((saved) => saved.kind === record.kind)) continue
    unique.push({
      kind: record.kind,
      answers: answersFrom(record.answers),
      createdAt: record.createdAt || new Date().toISOString(),
    })
  }
  commit(unique)
  return snapshot.records
}
