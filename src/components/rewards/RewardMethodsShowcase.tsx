import { Link } from 'react-router-dom'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui/button'
import { PopularRewardsCarousel } from '@/components/rewards/PopularRewardsCarousel'
import { TrustedPartnersCarousel } from '@/components/rewards/TrustedPartnersCarousel'
import { paths } from '@/config/paths'
import type { RewardMethod } from '@/content/rewardMethods'
import { useAuth } from '@/hooks/useAuth'

/** Curated Tremendous options; pass `methods` to limit them to what the panel has enabled. */
export function RewardMethodsShowcase({ methods }: { methods?: RewardMethod[] }) {
  const { user } = useAuth()
  const redeemTo = user ? paths.redeemRewards : paths.rewards

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Popular rewards"
          title="Redeem the way you prefer"
          description="The most popular international rewards from the Tremendous catalog. When you redeem, you only see the ones available in your country."
        />
        <PopularRewardsCarousel methods={methods} />
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link to={redeemTo}>{user ? 'Redeem Rewards' : 'Browse the catalog'}</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-line/80 bg-cream/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Trusted redemption partners"
            title="Payout brands members recognize"
            description="Prepaid Visa, PayPal, and gift cards from the Tremendous catalog — shown as a continuous showcase."
          />
          <div className="mt-10">
            <TrustedPartnersCarousel methods={methods} />
          </div>
        </div>
      </section>
    </>
  )
}
