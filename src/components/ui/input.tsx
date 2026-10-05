import { useEffect, useRef, type InputHTMLAttributes } from 'react'
import { isNumberStepperKey } from '@/lib/lockNumberInputs'
import { cn } from '@/lib/utils'

export function Input({ className, type = 'text', onKeyDown, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || type !== 'number') return

    const onWheel = (event: WheelEvent) => {
      if (document.activeElement === el) event.preventDefault()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [type])

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-line bg-cream px-3.5 text-sm text-ink transition-colors placeholder:text-muted hover:border-ink/25 focus-visible:border-brand-mid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/20 read-only:text-ink-soft read-only:hover:border-line disabled:cursor-not-allowed disabled:bg-paper disabled:opacity-70',
        className,
      )}
      {...props}
      onKeyDown={(event) => {
        if (type === 'number' && isNumberStepperKey(event.key)) {
          event.preventDefault()
        }
        onKeyDown?.(event)
      }}
    />
  )
}
