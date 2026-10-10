import { DEFAULT_PHONE_COUNTRY, findCountry } from '@/content/countries'
import { profileSectionCopy, type ProfileSectionId } from '@/content/profileQuestions'
import type { RegisterPayload } from '@/types/auth'
import { validateQuestions, type ProfileSections } from './profileQuestions'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u
export const PHONE_PATTERN = /^\d{7,15}$/
export const NAME_MAX_LENGTH = 30
export const PHONE_MAX_DIGITS = 15

export type RegisterStepId = 'account' | ProfileSectionId | 'privacy' | 'review'

export interface RegisterStep {
  id: RegisterStepId
  title: string
  heading: string
  copy: string
}

export const registerSteps: RegisterStep[] = [
  {
    id: 'account',
    title: 'Account',
    heading: 'Account Information',
    copy: 'Enter your details to create your Intensity Research account.',
  },
  { id: 'demographics', ...profileSectionCopy.demographics },
  { id: 'lifestyle', ...profileSectionCopy.lifestyle },
  { id: 'preferences', ...profileSectionCopy.preferences },
  {
    id: 'privacy',
    title: 'Privacy',
    heading: 'Privacy & consent',
    copy: 'Review your privacy choices and how you would like to hear from us.',
  },
  { id: 'review', title: 'Review', heading: 'Review your details', copy: 'Confirm everything looks right, then complete registration.' },
]

export const emptyRegisterForm: RegisterPayload = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  phoneCountry: DEFAULT_PHONE_COUNTRY,
  answers: {},
  emailInvitations: false,
  acceptTerms: false,
  acceptPrivacy: false,
}

export function validateNewPassword(password: string, confirmPassword: string) {
  const errors: Record<string, string> = {}
  if (password.length < 8) errors.password = 'Use at least 8 characters.'
  else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = 'Include a letter and a number.'
  }
  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.'
  else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function validatePhone(phoneCountry: string, phone: string) {
  const digits = phone.trim()
  if (!digits) return ''
  if (!PHONE_PATTERN.test(digits)) return 'Enter 7 to 15 digits, with no letters or symbols.'
  const country = findCountry(phoneCountry)
  if (!country) return 'Select a country code.'
  if (country.dial.length + digits.length > PHONE_MAX_DIGITS) {
    return 'This number is too long for the selected country code.'
  }
  return ''
}

function validateAccount(form: RegisterPayload) {
  const errors: Record<string, string> = {}
  const firstName = form.firstName.trim()
  const lastName = form.lastName.trim()
  if (!firstName) errors.firstName = 'First name is required.'
  else if (firstName.length > NAME_MAX_LENGTH) errors.firstName = 'First name must be 30 characters or fewer.'
  else if (!NAME_PATTERN.test(firstName)) errors.firstName = 'Enter a valid first name.'
  if (!lastName) errors.lastName = 'Last name is required.'
  else if (lastName.length > NAME_MAX_LENGTH) errors.lastName = 'Last name must be 30 characters or fewer.'
  else if (!NAME_PATTERN.test(lastName)) errors.lastName = 'Enter a valid last name.'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  const phoneError = validatePhone(form.phoneCountry, form.phone)
  if (phoneError) errors.phone = phoneError
  Object.assign(errors, validateNewPassword(form.password, form.confirmPassword))
  return errors
}

function validatePrivacy(form: RegisterPayload) {
  const errors: Record<string, string> = {}
  if (!form.acceptTerms) errors.acceptTerms = 'Please accept the Terms & Conditions and Privacy Policy to continue.'
  if (!form.acceptPrivacy) errors.acceptPrivacy = 'Please consent to data sharing for research to continue.'
  return errors
}

export function validateRegisterStep(form: RegisterPayload, stepId: RegisterStepId, sections: ProfileSections) {
  switch (stepId) {
    case 'account':
      return validateAccount(form)
    case 'demographics':
      return validateQuestions(sections.demographics, form.answers)
    case 'lifestyle':
    case 'preferences':
      return validateQuestions(sections[stepId], form.answers)
    case 'privacy':
      return validatePrivacy(form)
    case 'review':
      return {}
  }
}

/** Validates every registration step. */
export function validateRegisterForm(form: RegisterPayload, sections: ProfileSections, steps: RegisterStep[]) {
  return steps.reduce<Record<string, string>>(
    (errors, step) => ({ ...errors, ...validateRegisterStep(form, step.id, sections) }),
    {},
  )
}

export function firstInvalidStep(form: RegisterPayload, sections: ProfileSections, steps: RegisterStep[]) {
  const index = steps.findIndex((step) => Object.keys(validateRegisterStep(form, step.id, sections)).length > 0)
  return index === -1 ? steps.length - 1 : index
}
