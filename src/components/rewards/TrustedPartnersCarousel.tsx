import { showcaseRewardMethods, type RewardMethod } from '@/content/rewardMethods'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { cn } from '@/lib/utils'

function PartnerSlide({ method }: { method: RewardMethod }) {
  return (
    <div className="flex w-[9.5rem] shrink-0 flex-col items-center justify-center gap-3 rounded-2xl border border-line/80 bg-white px-4 py-5 shadow-card sm:w-[11rem]">
      <RewardMethodMark method={method} size="lg" decorative />
      <p className="truncate text-center text-sm font-medium text-ink">{method.name}</p>
    </div>
  )
}

/** Continuous CSS marquee — ~5 cards on desktop, fewer on smaller viewports via slide width. */
export function TrustedPartnersCarousel({
  methods = showcaseRewardMethods,
  className,
}: {
  methods?: RewardMethod[]
  className?: string
}) {
  const slides = methods.length ? methods : showcaseRewardMethods
  const loop = [...slides, ...slides]

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-cream to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-cream to-transparent sm:w-16" />
      <div className="partners-marquee flex w-max gap-3 py-1 sm:gap-4" aria-label="Trusted redemption partners">
        {loop.map((method, index) => (
          <PartnerSlide key={`${method.id}-${index}`} method={method} />
        ))}
      </div>
    </div>
  )
}
