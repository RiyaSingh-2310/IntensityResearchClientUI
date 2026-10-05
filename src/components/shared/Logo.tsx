import { useId } from 'react'
import { Link } from 'react-router-dom'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const gradientId = useId()
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('size-9 shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="4" y1="2" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3A66FF" />
          <stop offset="1" stopColor="#22C7E6" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
      <rect x="0.5" y="0.5" width="39" height="39" rx="10.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.18" />
      <circle cx="12" cy="12.6" r="2.7" fill="#FFFFFF" />
      <rect x="9.4" y="17.5" width="5.2" height="13" rx="2.6" fill="#FFFFFF" />
      <rect x="17.4" y="13.5" width="5.2" height="17" rx="2.6" fill="#FFFFFF" fillOpacity="0.92" />
      <rect x="25.4" y="8.5" width="5.2" height="22" rx="2.6" fill="#FFFFFF" fillOpacity="0.84" />
    </svg>
  )
}

interface LogoProps {
  to?: string
  /** `light` forces dark text for use on a light background regardless of the active theme. */
  tone?: 'theme' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { mark: 'size-8', name: 'text-[15px]', tag: 'text-[8.5px] tracking-[0.34em]' },
  md: { mark: 'size-9 sm:size-10', name: 'text-base sm:text-[17px]', tag: 'text-[9px] tracking-[0.36em]' },
  lg: { mark: 'size-12', name: 'text-xl', tag: 'text-[10px] tracking-[0.38em]' },
} as const

export function Logo({ to = '/', tone = 'theme', size = 'md', className }: LogoProps) {
  const s = sizes[size]
  return (
    <Link
      to={to}
      className={cn('group inline-flex shrink-0 items-center gap-2.5 rounded-xl', className)}
      aria-label={`${brand.name} home`}
    >
      <LogoMark className={cn(s.mark, 'transition-transform duration-300 motion-safe:group-hover:scale-105')} />
      <span className="flex flex-col leading-none" aria-hidden="true">
        <span className={cn('font-display font-semibold', s.name, tone === 'light' ? 'text-[#0b1324]' : 'text-strong')}>
          Intensity
        </span>
        <span className={cn('mt-1 font-semibold uppercase', s.tag, tone === 'light' ? 'text-[#2c55e8]' : 'text-accent')}>
          Research
        </span>
      </span>
    </Link>
  )
}
