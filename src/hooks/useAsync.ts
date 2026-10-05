/* eslint-disable react-hooks/set-state-in-effect -- data fetching hook intentionally loads in an effect */
import { useCallback, useEffect, useState } from 'react'
import { ApiRequestError } from '@/services/errors'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useAsync<T>(loader: () => Promise<T>, key = 'default') {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))
    loader()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((error) => {
        const message = error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.'
        if (!cancelled) setState({ data: null, loading: false, error: message })
      })

    return () => {
      cancelled = true
    }
    // Refresh when the cache key or a manual reload changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version])

  const reload = useCallback(() => {
    setVersion((current) => current + 1)
  }, [])

  return { ...state, reload }
}
