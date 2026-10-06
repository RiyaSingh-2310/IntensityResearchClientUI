import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
  light?: boolean
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  light,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl', className)}>
      {eyebrow ? (
        <p className={cn('mb-3 text-xs font-semibold tracking-[0.22em] uppercase', light ? 'text-accent' : 'text-brand')}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={cn('font-display text-3xl leading-tight text-balance sm:text-4xl', light ? 'text-cream' : 'text-ink')}>
        {title}
      </h2>
      {description ? (
        <p className={cn('mt-4 text-base leading-7', light ? 'text-cream/75' : 'text-ink-soft')}>{description}</p>
      ) : null}
    </div>
  )
}
