const TOKEN_KEYS = ['token', 'activation_token', 'activationToken'] as const

function fromSearch(search: URLSearchParams) {
  for (const key of TOKEN_KEYS) {
    const value = search.get(key)?.trim()
    if (value) return value
  }
  return ''
}

export function readActivationToken(search: URLSearchParams, hash = '', pathToken = '') {
  let token = fromSearch(search) || pathToken.trim()

  if (!token && hash) {
    const raw = hash.startsWith('#') ? hash.slice(1) : hash
    token = fromSearch(new URLSearchParams(raw.includes('=') ? raw : `token=${raw}`))
  }

  if (!token) return ''

  try {
    token = decodeURIComponent(token)
  } catch {
    /* keep original */
  }

  if (token.includes('://') || token.includes('token=')) {
    try {
      const nested = new URL(token, typeof window !== 'undefined' ? window.location.origin : 'https://localhost')
      token = fromSearch(nested.searchParams) || nested.pathname.split('/').filter(Boolean).at(-1) || token
    } catch {
      /* keep original */
    }
  }

  return token.trim()
}
