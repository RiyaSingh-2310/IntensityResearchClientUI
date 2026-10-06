import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-sm text-ink transition-colors placeholder:text-muted/80 focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10',
        className,
      )}
      {...props}
    />
  )
}
