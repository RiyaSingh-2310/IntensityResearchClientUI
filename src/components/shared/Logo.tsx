import { Link } from 'react-router-dom'
import logoUrl from '@/assets/brand/intensity-research-logo.png'
import logoReversedUrl from '@/assets/brand/intensity-research-logo-reversed.png'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

interface LogoProps {
  to?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const heights = {
  sm: 'h-9',
  md: 'h-10 sm:h-11',
  lg: 'h-14',
} as const

/** Shows the reversed artwork inside any `[data-theme='dark']` region and the full-colour artwork elsewhere. */
export function Logo({ to = '/', size = 'md', className }: LogoProps) {
  const imageClass = cn('w-auto select-none', heights[size])
  return (
    <Link
      to={to}
      className={cn('inline-flex shrink-0 items-center rounded-xl', className)}
      aria-label={`${brand.name} home`}
    >
      <img src={logoUrl} alt="" width={720} height={210} draggable={false} className={cn('logo-on-light', imageClass)} />
      <img
        src={logoReversedUrl}
        alt=""
        width={720}
        height={210}
        draggable={false}
        className={cn('logo-on-dark', imageClass)}
      />
    </Link>
  )
}
