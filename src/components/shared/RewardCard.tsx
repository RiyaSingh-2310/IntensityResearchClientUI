import type { ReactNode } from 'react'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { categoryLabels } from '@/lib/paymentMethods'
import { cn, formatNumber } from '@/lib/utils'
import type { RewardOption } from '@/types/reward'

export function RewardCard({
  reward,
  action,
  className,
}: {
  reward: RewardOption
  action?: ReactNode
  className?: string
}) {
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors duration-200 hover:border-brand-mid/50',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <RewardMethodMark method={reward} size="lg" decorative />
        <span className="rounded-full border border-line bg-raised px-2.5 py-1 text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
          {categoryLabels[reward.category]}
        </span>
      </div>
      <h3 className="font-display mt-5 text-xl font-semibold text-strong">{reward.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{reward.description}</p>
      <dl className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-4 py-3 text-sm">
        <dt className="text-muted">Minimum to redeem</dt>
        <dd className="font-semibold text-ink">
          {reward.pointsRequired > 0 ? `${formatNumber(reward.pointsRequired)} points` : 'Shown at redemption'}
        </dd>
      </dl>
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  )
}
