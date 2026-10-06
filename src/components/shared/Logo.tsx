import { Link } from 'react-router-dom'
import brandLogo from '@/assets/brand/intensity-research-logo.png'
import footerLogo from '@/assets/brand/intensity-research-logo-reversed.png'
import { brand } from '@/config/brand'
import { cn } from '@/lib/utils'

interface LogoProps {
  to?: string
  inverted?: boolean
  compact?: boolean
  /** Use the dark-footer asset. Does not affect the header logo. */
  variant?: 'default' | 'footer'
  className?: string
}

export function Logo({
  to = '/',
  inverted = false,
  compact = false,
  variant = 'default',
  className,
}: LogoProps) {
  const isFooter = variant === 'footer'
  const src = isFooter ? footerLogo : brandLogo

  return (
    <Link
      to={to}
      className={cn(
        'inline-flex max-w-[min(100%,320px)] items-center',
        !compact && !isFooter && 'h-15 sm:h-16',
        inverted && !isFooter && 'rounded-lg bg-white px-2 py-1.5',
        className,
      )}
      aria-label={`${brand.name} home`}
    >
      <img
        src={src}
        alt={brand.name}
        width={720}
        height={210}
        draggable={false}
        className={cn(
          'h-10 w-auto object-contain object-left select-none sm:h-11',
          compact && 'h-8 sm:h-9',
          isFooter && 'h-10 sm:h-12',
        )}
      />
    </Link>
  )
}
