import { ChevronDown, Globe } from 'lucide-react'
import { countryOptions } from '@/content/countries'
import { cn } from '@/lib/utils'

export function RewardCountrySelect({
  id,
  value,
  onValueChange,
  disabled,
  className,
  ...aria
}: {
  id?: string
  value: string
  onValueChange: (code: string) => void
  disabled?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}) {
  return (
    <div className={cn('relative', className)}>
      <Globe className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        autoComplete="country"
        className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-line bg-white pr-10 pl-10 text-sm font-medium text-ink shadow-soft transition-colors focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-60"
        {...aria}
      >
        {countryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
    </div>
  )
}
