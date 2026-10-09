import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { composePhone } from '@/content/countries'
import { takePendingOnboarding } from '@/lib/pendingOnboarding'
import { ADDITIONAL_PROFILE_PROMPT_KEY } from '@/services/additionalProfile.service'
import { authService } from '@/services/auth.service'
import { onboardingService } from '@/services/onboarding.service'
import { ApiRequestError, UNAUTHORIZED_EVENT } from '@/services/errors'
import { clearToken, readToken, writeToken } from '@/services/token'
import type { AuthUser, LoginPayload, RegisterOutcome, RegisterPayload } from '@/types/auth'

export interface AuthContextValue {
  user: AuthUser | null
  ready: boolean
  /** True after the API rejected the stored token, until the next sign-in. */
  sessionExpired: boolean
  /** Set when a stored session could not be checked (network or server error); the token is kept. */
  connectionError: string
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<RegisterOutcome>
  completeSession: (token: string, user: AuthUser, rememberMe?: boolean) => void
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components -- context is consumed by useAuth
export const AuthContext = createContext<AuthContextValue | null>(null)

/** Only a rejected token ends the session; network failures and server errors must not sign the member out. */
function sessionRejected(error: unknown) {
  return error instanceof ApiRequestError && (error.status === 401 || error.status === 403)
}

function connectionMessage(error: unknown) {
  return error instanceof ApiRequestError ? error.message : 'Unable to reach the server. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(() => !readToken())
  const [sessionExpired, setSessionExpired] = useState(false)
  const [connectionError, setConnectionError] = useState('')

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setUser(null)
      return null
    }
    try {
      const nextUser = await authService.me()
      setConnectionError('')
      setUser(nextUser)
      return nextUser
    } catch (error) {
      if (sessionRejected(error)) {
        clearToken()
        setUser(null)
      } else {
        setConnectionError(connectionMessage(error))
      }
      return null
    }
  }, [])

  useEffect(() => {
    const token = readToken()
    if (!token) return

    let cancelled = false
    authService
      .me()
      .then((nextUser) => {
        if (cancelled) return
        if (nextUser.is_verified === 0) {
          clearToken()
          setUser(null)
          return
        }
        setUser(nextUser)
      })
      .catch((error) => {
        if (sessionRejected(error)) clearToken()
        else if (!cancelled) setConnectionError(connectionMessage(error))
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function onUnauthorized() {
      setSessionExpired(true)
      setUser(null)
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const completeSession = useCallback((token: string, nextUser: AuthUser, rememberMe = true) => {
    writeToken(token, rememberMe)
    setSessionExpired(false)
    setConnectionError('')
    setUser(nextUser)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authService.login({ email: payload.email, password: payload.password })
    completeSession(session.token, session.user, payload.rememberMe)
    const pending = takePendingOnboarding(session.user.email)
    if (pending.length) {
      try {
        await onboardingService.saveAnswers(pending)
      } catch {
        /* Profile settings can retry; login must still succeed. */
      }
    }
  }, [completeSession])

  const register = useCallback(async (payload: RegisterPayload): Promise<RegisterOutcome> => {
    const result = await authService.register({
      name: `${payload.firstName.trim()} ${payload.lastName.trim()}`.trim(),
      email: payload.email.trim(),
      password: payload.password,
      phone: composePhone(payload.phoneCountry, payload.phone) || undefined,
    })
    return { status: 'registered', needsVerification: true, emailSent: result.emailSent, emailError: result.emailError }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (readToken()) await authService.logout()
    } catch (error) {
      if (!(error instanceof ApiRequestError) || error.status !== 401) {
        // Still discard the local session.
      }
    } finally {
      clearToken()
      sessionStorage.removeItem(ADDITIONAL_PROFILE_PROMPT_KEY)
      setConnectionError('')
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, ready, sessionExpired, connectionError, login, register, completeSession, refresh, logout }),
    [user, ready, sessionExpired, connectionError, login, register, completeSession, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
