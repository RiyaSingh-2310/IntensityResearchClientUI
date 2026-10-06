import { ChevronDown } from 'lucide-react'
import { NumericInput } from '@/components/ui/numeric-input'
import { dialCodeOptions, findCountry } from '@/content/countries'
import { cn } from '@/lib/utils'

interface PhoneInputProps {
  id: string
  country: string
  number: string
  onCountryChange: (code: string) => void
  onNumberChange: (value: string) => void
  maxDigits?: number
  placeholder?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function PhoneInput({
  id,
  country,
  number,
  onCountryChange,
  onNumberChange,
  maxDigits = 15,
  placeholder = 'Enter mobile number',
  ...aria
}: PhoneInputProps) {
  const dial = findCountry(country)?.dial
  const invalid = Boolean(aria['aria-invalid'])

  return (
    <div className="flex gap-2">
      <div
        className={cn(
          'relative h-11 shrink-0 rounded-xl border border-line bg-white transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10',
          invalid && 'border-danger ring-4 ring-danger/10',
        )}
      >
        <span aria-hidden="true" className="pointer-events-none flex h-full items-center gap-1 pr-2.5 pl-3 text-sm text-ink">
          {dial ? `+${dial}` : '+'}
          <ChevronDown className="size-4 text-muted" />
        </span>
        <select
          id={`${id}-country`}
          aria-label="Mobile number country code"
          autoComplete="tel-country-code"
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer appearance-none rounded-xl opacity-0"
        >
          {dialCodeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <NumericInput
        id={id}
        placeholder={placeholder}
        autoComplete="tel-national"
        integer
        maxDigits={maxDigits}
        value={number}
        onValueChange={onNumberChange}
        className="min-w-0 flex-1"
        {...aria}
      />
    </div>
  )
}
