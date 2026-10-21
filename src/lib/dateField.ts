export const MIN_DATE = '1900-01-01'

export function todayIso(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function parseIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return { year, month, day }
}

export function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function formatIsoDate(value: string) {
  const parsed = parseIsoDate(value)
  if (!parsed) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(parsed.year, parsed.month - 1, parsed.day),
  )
}

/** Empty is allowed. Invalid, future, and pre-1900 dates are rejected. No minimum age is defined. */
export function dateFieldError(value: string, max = todayIso()) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!parseIsoDate(trimmed) || trimmed < MIN_DATE || trimmed > max) return 'Please enter a valid date of birth.'
  return ''
}

export function monthGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const leading = first.getDay()
  const count = new Date(year, month, 0).getDate()
  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = []
  for (let index = 0; index < leading; index += 1) {
    const date = new Date(year, month - 1, 1 - (leading - index))
    cells.push({
      iso: toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      day: date.getDate(),
      inMonth: false,
    })
  }
  for (let day = 1; day <= count; day += 1) {
    cells.push({ iso: toIsoDate(year, month, day), day, inMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const parsed = parseIsoDate(cells[cells.length - 1].iso)
    const date = new Date(parsed?.year ?? year, (parsed?.month ?? month) - 1, (parsed?.day ?? 1) + 1)
    cells.push({
      iso: toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate()),
      day: date.getDate(),
      inMonth: false,
    })
  }
  return cells
}
