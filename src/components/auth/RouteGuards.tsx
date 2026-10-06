import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { returnPath } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'
import { ErrorState } from '@/components/shared/PageState'
import { Skeleton } from '@/components/ui/skeleton'
import { readToken } from '@/services/token'

function AuthBoot() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-paper">
      <div className="w-full max-w-sm space-y-3 p-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { user, ready, sessionExpired, connectionError, refresh } = useAuth()
  const location = useLocation()
  const [retrying, setRetrying] = useState(false)

  if (!ready || retrying) return <AuthBoot />
  if (!user && connectionError && readToken()) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-paper px-4">
        <div className="w-full max-w-lg">
          <ErrorState
            message={connectionError}
            onRetry={() => {
              setRetrying(true)
              void refresh().finally(() => setRetrying(false))
            }}
          />
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname, sessionExpired }} />
  return <Outlet />
}

export function GuestRoute() {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <AuthBoot />
  if (user) return <Navigate to={returnPath((location.state as { from?: unknown } | null)?.from)} replace />
  return <Outlet />
}
