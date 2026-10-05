import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { composePhone } from '@/content/countries'
import { takePendingOnboarding } from '@/lib/pendingOnboarding'
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
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<RegisterOutcome>
  completeSession: (token: string, user: AuthUser, rememberMe?: boolean) => void
  refresh: () => Promise<AuthUser | null>
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components -- context is consumed by useAuth
export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(() => !readToken())
  const [sessionExpired, setSessionExpired] = useState(false)

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setUser(null)
      return null
    }
    try {
      const nextUser = await authService.me()
      setUser(nextUser)
      return nextUser
    } catch {
      clearToken()
      setUser(null)
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
      .catch(() => {
        clearToken()
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
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, ready, sessionExpired, login, register, completeSession, refresh, logout }),
    [user, ready, sessionExpired, login, register, completeSession, refresh, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
