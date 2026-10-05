import { clientResetPasswordPageUrl } from '@/config/env'
import type { AuthSession, ForgotPasswordPayload, LoginPayload, ResetPasswordPayload } from '@/types/auth'
import { brand } from '@/config/brand'
import type { AuthSuccessData, Panelist } from '@/types/api'
import { ApiRequestError } from './errors'
import { apiRequest } from './http'

export const DUPLICATE_EMAIL_MESSAGE =
  'This email is already registered. Please use a different email address.'

const verifyInFlight = new Map<string, Promise<undefined>>()

function requireUser(data: Panelist | { user: Panelist } | undefined): Panelist {
  if (data && typeof data === 'object' && 'user' in data && data.user?.email) return data.user
  if (data && typeof data === 'object' && 'email' in data && data.email) return data
  throw new ApiRequestError({ message: 'Unable to load your profile.' })
}

function isUnverifiedPanelist(user: Panelist) {
  const status = String(user.status ?? '').toLowerCase()
  return user.is_verified === 0 || status === 'inactive' || status === 'pending'
}

function requireSession(data: AuthSuccessData | undefined, fallback: string): AuthSession {
  if (!data?.token || !data.user) {
    throw new ApiRequestError({ message: fallback })
  }
  if (isUnverifiedPanelist(data.user)) {
    throw new ApiRequestError({ message: 'Please verify your email before logging in.' }, 403)
  }
  return { token: data.token, user: data.user }
}

export const authService = {
  login(payload: Pick<LoginPayload, 'email' | 'password'>) {
    return apiRequest<AuthSuccessData>('/auth/login', {
      method: 'POST',
      body: { email: payload.email, password: payload.password },
      auth: false,
    }).then((data) => requireSession(data, 'Login did not return a session.'))
  },
  register(payload: { name: string; email: string; password: string; phone?: string }) {
    const body: Record<string, string> = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }
    if (payload.phone) body.phone = payload.phone
    // The API sends the activation email. 409 means the email is already registered.
    // Never auto-call /auth/resend-activation. Never persist a registration token as a session.
    return apiRequest<AuthSuccessData | undefined>('/auth/register', {
      method: 'POST',
      body,
      auth: false,
    }).then((data) => ({
      // Strict: only treat as sent when backend sets data.email_sent === true.
      emailSent: data?.email_sent === true,
      emailError: typeof data?.email_error === 'string' ? data.email_error : undefined,
    }))
  },
  verify(token: string) {
    const existing = verifyInFlight.get(token)
    if (existing) return existing
    // Do not store a returned token (no auto-login after activation).
    const request = apiRequest<AuthSuccessData | undefined>('/auth/verify', {
      method: 'POST',
      body: { token },
      auth: false,
    })
      .then(() => undefined)
      .catch((error) => {
        verifyInFlight.delete(token)
        throw error
      })
    verifyInFlight.set(token, request)
    return request
  },
  resendActivation(email: string) {
    // Success: 200 with message only (no email_sent field). Failure while sending: 502.
    return apiRequest<AuthSuccessData | undefined>('/auth/resend-activation', {
      method: 'POST',
      body: { email },
      auth: false,
    }).then(() => ({ emailSent: true as const }))
  },
  /**
   * The API emails `page_url?token=…` and normally keeps the token out of the response.
   * Builds that still return `reset_token` send no email, so that token is handed back
   * for the reset step instead.
   */
  forgotPassword(payload: ForgotPasswordPayload) {
    return apiRequest<{ reset_token?: unknown } | null | undefined>('/auth/forgot-password', {
      method: 'POST',
      auth: false,
      withMessage: true,
      body: {
        email: payload.email.trim(),
        page_url: clientResetPasswordPageUrl(),
      },
    }).then(({ data, message }) => ({
      message: message.trim(),
      resetToken: typeof data?.reset_token === 'string' ? data.reset_token.trim() : '',
    }))
  },
  resetPassword(payload: ResetPasswordPayload) {
    return apiRequest<unknown>('/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: {
        token: payload.token.trim(),
        password: payload.password,
      },
    })
  },
  /**
   * Settings password change for the signed-in panelist (PUT /me/password, Bearer token).
   * The published Intensity API docs do not list this route yet; a 404 is reported to the user
   * rather than falling back to the forgot-password email flow.
   */
  async changePassword(payload: { currentPassword: string; newPassword: string }) {
    try {
      return await apiRequest<unknown>('/me/password', {
        method: 'PUT',
        body: { current_password: payload.currentPassword, new_password: payload.newPassword },
        withMessage: true,
        keepSessionOn401: true,
      })
    } catch (error) {
      if (error instanceof ApiRequestError && (error.status === 404 || error.status === 405)) {
        throw new ApiRequestError(
          {
            message: `Changing your password from Settings is not available on the server yet. Please contact ${brand.email} for help.`,
          },
          error.status,
        )
      }
      if (!(error instanceof ApiRequestError) || error.status !== 401) throw error
      // A 401 here can mean a wrong current password or an expired session; GET /me tells them
      // apart and signs the user out through the normal 401 handling if the token is invalid.
      await authService.me()
      const message = /^unauthori[sz]ed\.?$/i.test(error.message.trim())
        ? 'Your current password is incorrect.'
        : error.message
      throw new ApiRequestError(
        { message, fieldErrors: { current_password: message, ...error.fieldErrors } },
        401,
      )
    }
  },
  logout() {
    return apiRequest<unknown>('/auth/logout', { method: 'POST' })
  },
  me() {
    return apiRequest<Panelist | { user: Panelist }>('/me').then(requireUser)
  },
  updateMe(payload: { name?: string; phone?: string }) {
    return apiRequest<Panelist | { user: Panelist }>('/me', {
      method: 'PUT',
      body: payload,
    }).then(requireUser)
  },
  uploadPhoto(file: File) {
    const body = new FormData()
    body.append('photo', file)
    return apiRequest<Panelist | { user: Panelist }>('/me/photo', {
      method: 'POST',
      body,
    }).then(requireUser)
  },
}
