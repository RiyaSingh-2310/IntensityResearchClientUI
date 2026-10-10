import type { AdditionalProfileKind } from '@/content/questionnaires'
import {
  extractAnswerRows,
  parseAnswerRows,
  parseProfileQuestions,
  parseProfileSummaries,
  readCreatedAt,
  readProfileId,
  type AdditionalAnswerMap,
  type AdditionalProfileAnswerInput,
  type ProfileQuestionSet,
} from '@/lib/additionalProfileForm'
import {
  markAdditionalProfilesHydrated,
  missingSessionProfiles,
  persistAdditionalProfile,
  replaceAdditionalProfiles,
  sessionProfileRecord,
  sessionProfileRecords,
  type StoredAdditionalProfile,
} from '@/lib/additionalProfileSession'
import { ApiRequestError } from './errors'
import { apiRequest } from './http'

/** Dismisses the post-login prompt for the current browser session only. Cleared on logout. */
export const ADDITIONAL_PROFILE_PROMPT_KEY = 'ir.additional-profile.prompt-dismissed'

const questionCache = new Map<AdditionalProfileKind, ProfileQuestionSet>()
let stateRequest: Promise<AdditionalProfileState> | null = null

export interface AdditionalProfileRecord {
  id: number
  kind: AdditionalProfileKind
  answers: AdditionalAnswerMap
  createdAt: string
}

export interface AdditionalProfileState {
  profiles: AdditionalProfileRecord[]
  creatableKinds: AdditionalProfileKind[]
}

function toRecord(record: StoredAdditionalProfile): AdditionalProfileRecord {
  return { id: record.id, kind: record.kind, answers: record.answers, createdAt: record.createdAt }
}

function remember(record: AdditionalProfileRecord, mode: 'create' | 'update') {
  try {
    return toRecord(persistAdditionalProfile(record, mode))
  } catch (error) {
    if (error instanceof ApiRequestError) throw error
    const message = error instanceof Error ? error.message : 'Your profile could not be saved. Please try again.'
    throw new ApiRequestError({ message })
  }
}

async function loadState(): Promise<AdditionalProfileState> {
  const listed = await apiRequest<unknown>('/additional-profiles')
  const summaries = parseProfileSummaries(listed)
  const records = await Promise.all(
    summaries.map(async (summary) => {
      const detail = await apiRequest<unknown>(`/additional-profiles/${summary.kind}/${summary.id}`)
      const answers = parseAnswerRows(extractAnswerRows(detail))
      return {
        id: readProfileId(detail, summary.kind) || summary.id,
        kind: summary.kind,
        answers,
        createdAt: readCreatedAt(detail) || summary.createdAt || new Date().toISOString(),
      }
    }),
  )
  replaceAdditionalProfiles(records)
  return {
    profiles: sessionProfileRecords().map(toRecord),
    creatableKinds: missingSessionProfiles(),
  }
}

export const additionalProfileService = {
  getQuestions(kind: AdditionalProfileKind) {
    const cached = questionCache.get(kind)
    if (cached) return Promise.resolve(cached)
    return apiRequest<unknown>(`/profile-questions?profile_type=${encodeURIComponent(kind)}`).then((data) => {
      const parsed = parseProfileQuestions(data)
      if (!parsed) throw new ApiRequestError({ message: 'Profile questions could not be loaded.' })
      questionCache.set(kind, parsed)
      return parsed
    })
  },
  getState() {
    if (!stateRequest) {
    stateRequest = loadState()
      .then((state) => {
        markAdditionalProfilesHydrated(true)
        return state
      })
      .catch((error) => {
        markAdditionalProfilesHydrated(false)
        throw error
      })
      .finally(() => {
        stateRequest = null
      })
    }
    return stateRequest
  },
  async create(kind: AdditionalProfileKind, answers: AdditionalAnswerMap, payload: AdditionalProfileAnswerInput[]) {
    const saved = await apiRequest<unknown>('/additional-profiles', {
      method: 'POST',
      body: { profile_type: kind, answers: payload },
    })
    let id = readProfileId(saved, kind)
    if (!id) {
      const listed = await apiRequest<unknown>('/additional-profiles')
      id = parseProfileSummaries(listed).find((item) => item.kind === kind)?.id ?? 0
    }
    if (!id) throw new ApiRequestError({ message: 'Your profile was saved, but its id could not be read. Refresh and try again.' })
    const returned = parseAnswerRows(extractAnswerRows(saved))
    return remember(
      {
        id,
        kind,
        answers: Object.keys(returned).length ? returned : answers,
        createdAt: readCreatedAt(saved) || new Date().toISOString(),
      },
      'create',
    )
  },
  async update(kind: AdditionalProfileKind, answers: AdditionalAnswerMap, payload: AdditionalProfileAnswerInput[]) {
    const existing = sessionProfileRecord(kind)
    if (!existing) throw new ApiRequestError({ message: 'This profile has not been created yet.' })
    const saved = await apiRequest<unknown>(`/additional-profiles/${kind}/${existing.id}`, {
      method: 'PUT',
      body: { answers: payload },
    })
    const returned = parseAnswerRows(extractAnswerRows(saved))
    return remember(
      {
        id: readProfileId(saved, kind) || existing.id,
        kind,
        answers: Object.keys(returned).length ? returned : answers,
        createdAt: readCreatedAt(saved) || existing.createdAt,
      },
      'update',
    )
  },
}
