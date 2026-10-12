export interface PostalRule {
  /** Characters accepted while typing. */
  mode: 'digits' | 'zip' | 'canada' | 'uk' | 'generic'
  maxLength: number
  message: string
}

const INDIA = 'Enter a 6-digit PIN code.'
const US = 'Enter a 5-digit ZIP code, or ZIP+4 as 12345-6789.'
const CANADA = 'Enter a Canadian postal code, such as A1A 1A1.'
const UK = 'Enter a UK postcode, such as SW1A 1AA.'
const GENERIC = 'Enter a valid postal code for the selected country.'

/** Exact digit length for countries whose postal codes are numeric only. */
const DIGIT_LENGTHS: Record<string, number> = {
  australia: 4,
  austria: 4,
  belgium: 4,
  switzerland: 4,
  norway: 4,
  denmark: 4,
  newzealand: 4,
  southafrica: 4,
  hungary: 4,
  france: 5,
  germany: 5,
  italy: 5,
  spain: 5,
  finland: 5,
  mexico: 5,
  malaysia: 5,
  turkey: 5,
  indonesia: 5,
  thailand: 5,
  india: 6,
  china: 6,
  singapore: 6,
  russia: 6,
  romania: 6,
  vietnam: 6,
  nigeria: 6,
  philippines: 4,
  japan: 7,
  brazil: 8,
}

function compactCountry(label: string) {
  return label
    .replace(/^\s*\d+\.\s*/, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '')
}

export function isPostalQuestionLabel(label: string) {
  return /zip|postal|pin code/i.test(label)
}

export function postalRuleForCountry(countryLabel: string): PostalRule {
  const country = compactCountry(countryLabel)
  if (country === 'india') return { mode: 'digits', maxLength: 6, message: INDIA }
  if (country === 'unitedstates' || country === 'unitedstatesofamerica' || country === 'usa') {
    return { mode: 'zip', maxLength: 10, message: US }
  }
  if (country === 'canada') return { mode: 'canada', maxLength: 7, message: CANADA }
  if (country === 'unitedkingdom' || country === 'uk' || country === 'greatbritain') {
    return { mode: 'uk', maxLength: 8, message: UK }
  }
  if (country === 'japan') return { mode: 'zip', maxLength: 8, message: 'Enter a 7-digit postal code, such as 123-4567.' }
  if (country === 'brazil') return { mode: 'zip', maxLength: 9, message: 'Enter an 8-digit postal code, such as 12345-678.' }
  const length = DIGIT_LENGTHS[country]
  if (length) {
    return { mode: 'digits', maxLength: length, message: `Enter a ${length}-digit postal code.` }
  }
  return { mode: 'generic', maxLength: 12, message: GENERIC }
}

export function sanitizePostalInput(countryLabel: string, value: string) {
  const rule = postalRuleForCountry(countryLabel)
  if (rule.mode === 'digits') return value.replace(/\D/g, '').slice(0, rule.maxLength)
  if (rule.mode === 'zip') {
    const digits = value.replace(/\D/g, '').slice(0, rule.maxLength === 8 ? 7 : rule.maxLength === 9 ? 8 : 9)
    const splitAt = rule.maxLength === 8 ? 3 : 5
    if (digits.length <= splitAt) return digits
    return `${digits.slice(0, splitAt)}-${digits.slice(splitAt)}`.slice(0, rule.maxLength)
  }
  if (rule.mode === 'canada') {
    const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    return compact.length > 3 ? `${compact.slice(0, 3)} ${compact.slice(3)}` : compact
  }
  if (rule.mode === 'uk') return value.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').slice(0, rule.maxLength)
  return value.replace(/[^A-Za-z0-9 -]/g, '').slice(0, rule.maxLength)
}

export function postalCodeError(countryLabel: string, value: string) {
  const trimmed = value.trim()
  if (!trimmed || !countryLabel.trim()) return ''
  const rule = postalRuleForCountry(countryLabel)
  const country = compactCountry(countryLabel)
  if (rule.mode === 'digits') return new RegExp(`^\\d{${rule.maxLength}}$`).test(trimmed) ? '' : rule.message
  if (country === 'unitedstates' || country === 'unitedstatesofamerica' || country === 'usa') {
    return /^\d{5}(-\d{4})?$/.test(trimmed) ? '' : rule.message
  }
  if (country === 'japan') return /^\d{3}-\d{4}$/.test(trimmed) ? '' : rule.message
  if (country === 'brazil') return /^\d{5}-\d{3}$/.test(trimmed) ? '' : rule.message
  if (rule.mode === 'canada') return /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$/.test(trimmed) ? '' : rule.message
  if (rule.mode === 'uk') return /^(GIR 0AA|[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2})$/.test(trimmed) ? '' : rule.message
  return /^[A-Za-z0-9][A-Za-z0-9 -]{1,11}$/.test(trimmed) ? '' : rule.message
}
