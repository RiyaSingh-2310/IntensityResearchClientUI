import type { AdditionalProfileKind, QuestionnaireAnswers } from '@/content/questionnaires'
import {
  missingSessionProfiles,
  persistAdditionalProfile,
  replaceAdditionalProfiles,
  sessionProfileRecords,
  type StoredAdditionalProfile,
} from '@/lib/additionalProfileSession'
import { ApiRequestError } from './errors'
import { apiRequest } from './http'

/**
 * Intensity's published API (https://intensityresearch.com/intensityapi/docs/) has
 * /questions, /dropdowns, and /onboarding/answers for the primary profile only.
 * It has no additional-profile create, list, or update endpoints.
 * Paths stay blank until that contract exists. Until then, profiles are saved
 * for the signed-in account in this browser, in the order they were created.
 */
/** Dismisses the post-login prompt for the current browser session only. Cleared on logout. */
export const ADDITIONAL_PROFILE_PROMPT_KEY = 'ir.additional-profile.prompt-dismissed'

export const additionalProfileEndpoints = {
  state: '',
  create: '',
  update: '',
  view: '',
} as const

export interface AdditionalProfileRecord {
  kind: AdditionalProfileKind
  answers: QuestionnaireAnswers
  createdAt: string
}

export interface AdditionalProfileState {
  profiles: AdditionalProfileRecord[]
  creatableKinds: AdditionalProfileKind[]
}

function localState(): AdditionalProfileState {
  return {
    profiles: sessionProfileRecords().map(toRecord),
    creatableKinds: missingSessionProfiles(),
  }
}

function toRecord(record: StoredAdditionalProfile): AdditionalProfileRecord {
  return { kind: record.kind, answers: record.answers, createdAt: record.createdAt }
}

function asError(error: unknown) {
  if (error instanceof ApiRequestError) return error
  const message = error instanceof Error ? error.message : 'Your profile could not be saved. Please try again.'
  return new ApiRequestError({ message })
}

function remember(record: AdditionalProfileRecord, mode: 'create' | 'update') {
  try {
    return toRecord(persistAdditionalProfile(record.kind, record.answers, mode))
  } catch (error) {
    throw asError(error)
  }
}

export const additionalProfileService = {
  async getState(): Promise<AdditionalProfileState> {
    if (!additionalProfileEndpoints.state) return localState()
    const remote = await apiRequest<AdditionalProfileState>(additionalProfileEndpoints.state)
    const profiles = Array.isArray(remote.profiles) ? remote.profiles : []
    replaceAdditionalProfiles(
      profiles.map((profile) => ({
        kind: profile.kind,
        answers: profile.answers ?? {},
        createdAt: profile.createdAt || new Date().toISOString(),
      })),
    )
    return localState()
  },
  async view(kind: AdditionalProfileKind): Promise<AdditionalProfileRecord> {
    if (additionalProfileEndpoints.view) {
      return apiRequest<AdditionalProfileRecord>(`${additionalProfileEndpoints.view}?type=${encodeURIComponent(kind)}`)
    }
    const saved = sessionProfileRecords().find((record) => record.kind === kind)
    if (!saved) throw new ApiRequestError({ message: 'This profile has not been created yet.' })
    return toRecord(saved)
  },
  async create(kind: AdditionalProfileKind, answers: QuestionnaireAnswers): Promise<AdditionalProfileRecord> {
    if (additionalProfileEndpoints.create) {
      const saved = await apiRequest<AdditionalProfileRecord>(additionalProfileEndpoints.create, {
        method: 'POST',
        body: { kind, answers },
      })
      return remember({ ...saved, kind, answers: saved.answers ?? answers, createdAt: saved.createdAt || new Date().toISOString() }, 'create')
    }
    return remember({ kind, answers, createdAt: new Date().toISOString() }, 'create')
  },
  async update(kind: AdditionalProfileKind, answers: QuestionnaireAnswers): Promise<AdditionalProfileRecord> {
    if (additionalProfileEndpoints.update) {
      const saved = await apiRequest<AdditionalProfileRecord>(additionalProfileEndpoints.update, {
        method: 'PUT',
        body: { kind, answers },
      })
      return remember({ ...saved, kind, answers: saved.answers ?? answers, createdAt: saved.createdAt || new Date().toISOString() }, 'update')
    }
    const existing = sessionProfileRecords().find((record) => record.kind === kind)
    return remember({ kind, answers, createdAt: existing?.createdAt ?? new Date().toISOString() }, 'update')
  },
}

/** The eight new About You questions are frontend configuration. The live /questions list does not include them. */
export const aboutYouAnswerEndpoint = ''

export async function saveAboutYouAnswers(answers: QuestionnaireAnswers) {
  void answers
  if (!aboutYouAnswerEndpoint) {
    throw new ApiRequestError({
      message:
        'These About You questions are not on the Intensity API yet, so the new answers were not stored. Your existing profile questions were saved separately.',
      code: 'about-you-api-not-configured',
    })
  }
}
