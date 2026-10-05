import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border border-line bg-cream px-3.5 py-3 text-sm text-ink transition-colors placeholder:text-muted hover:border-ink/25 focus-visible:border-brand-mid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/20',
        className,
      )}
      {...props}
    />
  )
}
