export type ProfileSectionId = 'demographics' | 'lifestyle' | 'preferences'

export type ProfileFieldType = 'dropdown' | 'radio' | 'checkbox' | 'text'

/** Backend step numbers (`questioner.step_no`) that map to registration sections. */
export const API_STEP_SECTIONS: Record<number, ProfileSectionId> = {
  2: 'demographics',
  3: 'lifestyle',
  4: 'preferences',
}

/** Backend step that holds the Yes/No privacy and consent questions. */
export const PRIVACY_STEP_NO = 5

export const PROFILE_SECTION_IDS: ProfileSectionId[] = ['demographics', 'lifestyle', 'preferences']

export type ConsentField = 'acceptPrivacy' | 'emailInvitations' | 'acceptTerms'

/**
 * Consent checkboxes are stored as Yes/No answers on the Privacy-step questions
 * (matched by id first, then by question text).
 */
export const consentBindings: Array<{ field: ConsentField; ids: number[]; texts: string[] }> = [
  { field: 'acceptPrivacy', ids: [10], texts: ['Do you consent to data sharing?'] },
  { field: 'emailInvitations', ids: [11], texts: ['Opt in to marketing emails?'] },
  { field: 'acceptTerms', ids: [12], texts: ['Do you accept the terms?'] },
]

export const profileSectionCopy: Record<ProfileSectionId, { title: string; heading: string; copy: string }> = {
  demographics: {
    title: 'About you',
    heading: 'About you',
    copy: 'A few basics help us invite you to studies you qualify for.',
  },
  lifestyle: {
    title: 'Lifestyle',
    heading: 'Lifestyle & shopping',
    copy: 'Tell us how you live and shop so we can match you with relevant research.',
  },
  preferences: {
    title: 'Preferences',
    heading: 'Research preferences',
    copy: 'Choose the topics and timing that suit you best.',
  },
}
