export function sanitizeNumericInput(
  raw: string,
  options: {
    integer?: boolean
    maxDigits?: number
    decimalPlaces?: number
  } = {},
) {
  const integer = Boolean(options.integer)
  const decimalPlaces = options.decimalPlaces ?? 2
  let next = raw.replace(/[^\d.]/g, '')

  if (integer) {
    next = next.replace(/\./g, '')
    return options.maxDigits ? next.slice(0, options.maxDigits) : next
  }

  const firstDot = next.indexOf('.')
  if (firstDot !== -1) {
    const whole = next.slice(0, firstDot).replace(/\./g, '')
    const fraction = next.slice(firstDot + 1).replace(/\./g, '').slice(0, decimalPlaces)
    next = fraction.length || next.endsWith('.') ? `${whole}.${fraction}` : whole
  }

  if (options.maxDigits) {
    const digits = next.replace(/\D/g, '')
    if (digits.length > options.maxDigits) {
      const kept = digits.slice(0, options.maxDigits)
      if (next.includes('.')) {
        const wholeLen = next.split('.')[0]?.length ?? 0
        next = `${kept.slice(0, wholeLen)}.${kept.slice(wholeLen)}`
      } else {
        next = kept
      }
    }
  }

  return next
}

export function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, '').slice(0, maxLength)
}
