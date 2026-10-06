import { useCallback, useState } from 'react'
import { DEFAULT_PHONE_COUNTRY, findCountry, parsePhone } from '@/content/countries'
import { useAuth } from '@/hooks/useAuth'

function storageKey(userId?: number) {
  return `ir.rewardCountry.${userId ?? 'guest'}`
}

function readStored(key: string) {
  try {
    const value = localStorage.getItem(key) ?? ''
    return findCountry(value) ? value : ''
  } catch {
    return ''
  }
}

/** The API has no country of residence, so fall back to the phone's country, then the browser locale. */
function detectCountry(phone?: string | null) {
  if (phone?.trim().startsWith('+')) {
    const { country } = parsePhone(phone)
    if (findCountry(country)) return country
  }
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language]
  for (const language of languages) {
    try {
      const region = new Intl.Locale(language).region
      if (region && findCountry(region)) return region
    } catch {
      // Ignore malformed locale tags.
    }
  }
  return DEFAULT_PHONE_COUNTRY
}

/** Recipient country used to filter rewards; members can override it and the choice is remembered. */
export function useRewardCountry() {
  const { user } = useAuth()
  const key = storageKey(user?.id)
  const [selection, setSelection] = useState(() => ({ key, country: readStored(key) }))
  const stored = selection.key === key ? selection.country : readStored(key)
  const country = stored || detectCountry(user?.phone)

  const setCountry = useCallback(
    (code: string) => {
      setSelection({ key, country: code })
      try {
        localStorage.setItem(key, code)
      } catch {
        // Storage can be unavailable (private mode); the choice still applies for this visit.
      }
    },
    [key],
  )

  return [country, setCountry] as const
}
