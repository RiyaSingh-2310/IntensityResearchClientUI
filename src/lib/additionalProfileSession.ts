import { useSyncExternalStore } from 'react'
import { additionalProfileKinds, type AdditionalProfileKind } from '@/content/questionnaires'
import { useAuth } from '@/hooks/useAuth'
import type { AdditionalAnswerMap } from '@/lib/additionalProfileForm'
import { asNumber } from '@/lib/utils'

/**
 * Cached copy of additional profiles loaded from the Intensity API.
 * The cache keeps the menu and prompt in sync after a successful fetch.
 * Create, update, and the profile list itself always go through the API.
 */
const STORAGE_PREFIX = 'ir.additional-profiles.v2.'

export interface StoredAdditionalProfile {
  id: number
  kind: AdditionalProfileKind
  answers: AdditionalAnswerMap
  createdAt: string
}

export interface AdditionalProfileSnapshot {
  answers: Partial<Record<AdditionalProfileKind, AdditionalAnswerMap>>
  order: AdditionalProfileKind[]
  records: StoredAdditionalProfile[]
}

const EMPTY: AdditionalProfileSnapshot = { answers: {}, order: [], records: [] }

let boundUserId: string | null | undefined
let snapshot: AdditionalProfileSnapshot = EMPTY
let syncState: 'pending' | 'ready' | 'error' = 'pending'
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

function answersFrom(value: unknown): AdditionalAnswerMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const answers: AdditionalAnswerMap = {}
  for (const [key, answer] of Object.entries(value)) {
    if (typeof answer === 'string') answers[key] = answer
    else if (Array.isArray(answer) && answer.every((item) => typeof item === 'string')) answers[key] = answer
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
      const record = item as { id?: unknown; kind?: unknown; answers?: unknown; createdAt?: unknown }
      const id = asNumber(record.id)
      if (!isKind(record.kind) || !id) continue
      if (records.some((saved) => saved.kind === record.kind)) continue
      records.push({
        id,
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
  syncState = 'pending'
  snapshot = userId ? readStored(userId) : EMPTY
}

export function markAdditionalProfilesHydrated(ok: boolean) {
  const next = ok ? 'ready' : 'error'
  if (syncState === next) return
  syncState = next
  emit()
}

export function useAdditionalProfileSync() {
  useSessionProfiles()
  return useSyncExternalStore(subscribe, () => syncState, () => 'pending' as const)
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

export function sessionProfileRecord(kind: AdditionalProfileKind) {
  return snapshot.records.find((record) => record.kind === kind)
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

export function persistAdditionalProfile(record: StoredAdditionalProfile, mode: 'create' | 'update') {
  const existing = snapshot.records.find((item) => item.kind === record.kind)
  if (mode === 'create' && existing) {
    throw new Error('This profile has already been created.')
  }
  if (mode === 'update' && !existing) {
    throw new Error('This profile has not been created yet.')
  }
  const nextRecord: StoredAdditionalProfile = {
    id: record.id,
    kind: record.kind,
    answers: { ...record.answers },
    createdAt: existing?.createdAt ?? record.createdAt,
  }
  const records = existing
    ? snapshot.records.map((item) => (item.kind === record.kind ? nextRecord : item))
    : [...snapshot.records, nextRecord]
  commit(records)
  return nextRecord
}

export function replaceAdditionalProfiles(records: StoredAdditionalProfile[]) {
  const unique: StoredAdditionalProfile[] = []
  for (const record of records) {
    if (!isKind(record.kind) || unique.some((saved) => saved.kind === record.kind)) continue
    const id = asNumber(record.id)
    if (!id) continue
    unique.push({
      id,
      kind: record.kind,
      answers: answersFrom(record.answers),
      createdAt: record.createdAt || new Date().toISOString(),
    })
  }
  commit(unique)
  return snapshot.records
}
