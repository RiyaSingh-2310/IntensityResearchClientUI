import { Gift } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ComingSoonRewardCard, RewardCard } from '@/components/shared/RewardCard'
import { Button } from '@/components/ui/button'
import { getRewardAvailability } from '@/lib/rewards'
import { cn } from '@/lib/utils'
import type { RewardOption } from '@/types/reward'

export function RewardCategorySection({
  title,
  description,
  rewards,
  comingSoonSlots = 0,
  redeemTo,
  featuredId,
  onRedeem,
}: {
  title: string
  description: string
  rewards: RewardOption[]
  comingSoonSlots?: number
  redeemTo: string
  featuredId?: string
  onRedeem?: (reward: RewardOption) => void
}) {
  const slots = Array.from({ length: comingSoonSlots }, (_, index) => index)

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="inline-flex items-center gap-2 font-display text-3xl text-ink sm:text-4xl">
          <Gift className="size-6 text-brand" />
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft sm:text-base">{description}</p>
      </div>
      <div
        className={cn(
          'mt-10 grid gap-5',
          rewards.length + slots.length === 1
            ? 'sm:grid-cols-1 md:max-w-md md:mx-auto'
            : rewards.length + slots.length === 3
              ? 'sm:grid-cols-2 lg:grid-cols-3'
              : 'sm:grid-cols-2 xl:grid-cols-3',
        )}
      >
        {rewards.map((reward) => {
          const availability = getRewardAvailability(reward)
          const featured = featuredId === reward.id
          return (
            <RewardCard
              key={reward.id}
              reward={reward}
              featured={featured}
              action={
                availability === 'available' ? (
                  onRedeem ? (
                    <Button type="button" className="w-full" onClick={() => onRedeem(reward)}>
                      Redeem
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to={redeemTo}>Redeem</Link>
                    </Button>
                  )
                ) : (
                  <Button type="button" variant="outline" className="w-full" disabled>
                    Coming soon
                  </Button>
                )
              }
            />
          )
        })}
        {slots.map((slot) => (
          <ComingSoonRewardCard key={`soon-${title}-${slot}`} />
        ))}
      </div>
    </section>
  )
}
