/** Text questions that ask for a whole-number count, such as “How many children…”. */
export function isCountQuestion(label: string) {
  const text = label.trim()
  if (/\b(phone|postal|zip|pin|license|number)\b/i.test(text) && !/\bhow many\b/i.test(text)) return false
  return /\bhow many\b/i.test(text)
}

export function countMaxDigits(label: string) {
  if (/\bchildren\b/i.test(label)) return 2
  if (/\byears\b/i.test(label)) return 3
  return 7
}

export const COUNT_ERROR = 'Enter a whole number using digits only.'

export function sanitizeCount(value: string, maxDigits: number) {
  return value.replace(/\D/g, '').slice(0, maxDigits)
}

/** Message when typed or pasted text contains anything other than a whole-number count. */
export function rejectedCountMessage(raw: string, maxDigits: number) {
  if (!raw) return ''
  return raw === sanitizeCount(raw, maxDigits) ? '' : COUNT_ERROR
}

export function countError(value: string, maxDigits: number) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!new RegExp(`^\\d{1,${maxDigits}}$`).test(trimmed)) return COUNT_ERROR
  return ''
}
