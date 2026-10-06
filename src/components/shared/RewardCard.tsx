import type { ReactNode } from 'react'
import type { RewardOption } from '@/types/reward'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { Badge } from '@/components/ui/badge'
import { categoryLabels, popularRewardIds } from '@/content/rewards'
import { getRewardAvailability } from '@/lib/rewards'
import { cn, formatNumber } from '@/lib/utils'

const availabilityLabel = {
  available: 'Available',
  'coming-soon': 'Coming soon',
  unavailable: 'Unavailable',
} as const

const availabilityTone = {
  available: 'success',
  'coming-soon': 'muted',
  unavailable: 'warning',
} as const

export function RewardCard({
  reward,
  action,
  featured = false,
  className,
}: {
  reward: RewardOption
  action?: ReactNode
  featured?: boolean
  className?: string
}) {
  const availability = getRewardAvailability(reward)
  const popular = reward.popular || (popularRewardIds as readonly string[]).includes(reward.id)
  const redeemable = availability === 'available'
  const Icon = reward.icon

  return (
    <article
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border bg-white shadow-card transition-all duration-200',
        featured ? 'border-brand/25 shadow-soft' : 'border-line/80',
        reward.category === 'charity' && 'bg-brand-soft/30',
        redeemable ? 'motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lift' : 'opacity-95',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        {reward.image ? (
          <RewardMethodMark method={{ name: reward.name, image: reward.image }} size="lg" decorative className="size-14" />
        ) : (
          <span
            className={cn(
              'grid size-14 place-items-center rounded-2xl font-semibold text-white shadow-soft',
              reward.logoLabel.length > 2 ? 'text-xs tracking-wide' : 'text-sm',
            )}
            style={{ backgroundColor: reward.accent }}
          >
            {Icon ? <Icon className="size-7" strokeWidth={1.75} /> : reward.logoLabel}
          </span>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          {popular ? (
            <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
              Popular
            </span>
          ) : null}
          <Badge tone={availabilityTone[availability]}>{availabilityLabel[availability]}</Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
          {categoryLabels[reward.category]}
        </p>
        <h3 className="font-display mt-1 text-2xl text-ink">{reward.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{reward.description}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-cream px-3 py-3">
            <dt className="text-xs text-muted">Points required</dt>
            <dd className="mt-1 font-medium text-ink">{formatNumber(reward.pointsRequired)}</dd>
          </div>
          <div className="rounded-xl bg-cream px-3 py-3">
            <dt className="text-xs text-muted">Delivery</dt>
            <dd className="mt-1 font-medium text-ink">{reward.delivery}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-muted">{reward.estimatedValueLabel} · value set per reward</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </article>
  )
}

export function ComingSoonRewardCard() {
  return (
    <article className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-line bg-cream/60 px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-white text-muted shadow-soft">
        <span className="font-display text-xl">+</span>
      </span>
      <h3 className="mt-5 font-display text-xl text-ink">More rewards</h3>
      <p className="mt-2 text-sm text-muted">Coming soon</p>
    </article>
  )
}
