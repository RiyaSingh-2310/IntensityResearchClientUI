import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'h-11 w-full appearance-none rounded-xl border border-line bg-white bg-[length:14px] bg-[right_12px_center] bg-no-repeat px-3.5 pr-10 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/10',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23686f69' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")",
      }}
      {...props}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
