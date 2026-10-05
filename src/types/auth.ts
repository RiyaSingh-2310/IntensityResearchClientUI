import type { Panelist } from './api'

export type AuthUser = Panelist

export interface LoginPayload {
  email: string
  password: string
  rememberMe: boolean
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
}

export interface RegisterAccount {
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterPersonal {
  firstName: string
  lastName: string
  /** National mobile number digits; the dialling code comes from `phoneCountry`. */
  phone: string
  /** ISO 3166-1 alpha-2 code of the mobile number's country. */
  phoneCountry: string
}

export interface RegisterPayload extends RegisterAccount, RegisterPersonal {
  answers: Record<string, string | string[]>
  /** Yes/No answer to the "Opt in to marketing emails?" privacy question. */
  emailInvitations: boolean
  /** Yes/No answer to the "Do you accept the terms?" privacy question. */
  acceptTerms: boolean
  /** Yes/No answer to the "Do you consent to data sharing?" privacy question. */
  acceptPrivacy: boolean
}

export type RegisterOutcome = {
  status: 'registered'
  needsVerification: boolean
  emailSent: boolean
  emailError?: string
}
