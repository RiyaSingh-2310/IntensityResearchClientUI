import { API_BASE_URL } from '@/config/env'
import type { ApiEnvelope } from '@/types/api'
import type { ApiError } from '@/types/common'
import { ApiRequestError, UNAUTHORIZED_EVENT } from './errors'
import { clearToken, readToken } from './token'

export { ApiRequestError }

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  withMessage?: boolean
  /** Leave the session alone on 401; the caller decides whether the token is really invalid. */
  keepSessionOn401?: boolean
}

function parseFieldErrors(errors: unknown): Record<string, string> | undefined {
  if (!errors || typeof errors !== 'object') return undefined
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(value) && value.length) out[key] = String(value[0])
    else if (typeof value === 'string' && value) out[key] = value
  }
  return Object.keys(out).length ? out : undefined
}

function statusMessage(status: number, fallback: string) {
  if (status === 401) return fallback || 'Your session has expired. Please sign in again.'
  if (status === 403) return fallback || 'Please verify your email before logging in.'
  if (status === 404) return fallback || 'We could not find that information.'
  if (status === 409) return fallback || 'An account with this email already exists.'
  if (status === 410) return fallback || 'This link has expired. Please request a new one.'
  if (status === 422) return fallback || 'Please check the highlighted fields and try again.'
  if (status >= 500) return fallback || 'The server is having trouble right now. Please try again.'
  return fallback || 'Something went wrong. Please try again.'
}

function toError(payload: unknown, status: number) {
  const envelope = payload as ApiEnvelope | ApiError | null
  const message =
    envelope && typeof envelope === 'object' && 'message' in envelope && typeof envelope.message === 'string'
      ? envelope.message
      : ''
  const fieldErrors =
    envelope && typeof envelope === 'object' && 'errors' in envelope
      ? parseFieldErrors((envelope as ApiEnvelope).errors)
      : envelope && typeof envelope === 'object' && 'fieldErrors' in envelope
        ? (envelope as ApiError).fieldErrors
        : undefined
  return new ApiRequestError(
    {
      message: statusMessage(status, message),
      fieldErrors,
    },
    status,
  )
}

export function apiRequest<T>(
  path: string,
  options: RequestOptions & { withMessage: true },
): Promise<{ data: T; message: string }>
export function apiRequest<T>(path: string, options?: RequestOptions): Promise<T>
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T | { data: T; message: string }> {
  if (!API_BASE_URL) {
    throw new ApiRequestError({ message: 'API base URL is not configured.' })
  }

  const method = options.method ?? 'GET'
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  if (options.body !== undefined && !isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  const sendAuth = options.auth !== false
  if (sendAuth) {
    const token = readToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body:
        options.body === undefined
          ? undefined
          : isFormData
            ? (options.body as FormData)
            : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiRequestError({
      message: 'Unable to reach the server. Check your connection and try again.',
    })
  }

  if (response.status === 204) {
    return undefined as T
  }

  let payload: unknown = null
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    if (response.status === 401 && sendAuth && !options.keepSessionOn401 && readToken()) {
      clearToken()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    throw toError(payload, response.status)
  }

  const envelope = payload as ApiEnvelope<T> | null
  const message =
    envelope && typeof envelope === 'object' && 'message' in envelope && typeof envelope.message === 'string'
      ? envelope.message
      : ''
  if (envelope && typeof envelope === 'object' && 'success' in envelope) {
    if (!envelope.success) {
      throw toError(envelope, response.status)
    }
    if (options.withMessage) return { data: envelope.data as T, message }
    return envelope.data as T
  }

  if (options.withMessage) return { data: payload as T, message }
  return payload as T
}
