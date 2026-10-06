import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RewardBenefits } from '@/components/rewards/RewardBenefits'
import { RedeemDialog } from '@/components/rewards/RedeemDialog'
import { RewardCategorySection } from '@/components/rewards/RewardCategorySection'
import { RewardCountrySelect } from '@/components/rewards/RewardCountrySelect'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { CtaSection } from '@/components/shared/CtaSection'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { PageHero } from '@/components/shared/PageHero'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { paths } from '@/config/paths'
import { countryName } from '@/content/countries'
import { rewardMethodsForCountry } from '@/content/rewardMethods'
import { rewardShowcase, rewardsCta, rewardsFaqs, rewardsHero } from '@/content/rewards'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { useRewardCountry } from '@/hooks/useRewardCountry'
import { rewardOptionFromMethod } from '@/lib/rewards'
import { formatNumber } from '@/lib/utils'
import { rewardService } from '@/services/reward.service'
import type { RewardOption } from '@/types/reward'

export function RewardsPage() {
  const { user } = useAuth()
  const catalog = useAsync(
    () => (user ? rewardService.getMemberCatalog() : rewardService.getCatalog()),
    user ? 'member' : 'public',
  )
  const { data, error, reload } = catalog
  const loading = catalog.loading && !data
  const [country, setCountry] = useRewardCountry()
  const [selected, setSelected] = useState<RewardOption | null>(null)
  const [message, setMessage] = useState('')
  const redeemTo = user ? paths.rewards : paths.join
  const points = data?.balancePoint ?? 0
  const minimum = data?.guide.minimumRedemption ?? 0
  const methods = useMemo(() => (data ? rewardMethodsForCountry(country, data.payout) : []), [country, data])
  const items = methods.map((method) => rewardOptionFromMethod(method, minimum))
  const recipientCountry = countryName(country) || country

  const cash = items.filter((item) => item.category === 'cash')
  const giftCards = items.filter((item) => item.category === 'gift-card' || item.category === 'digital')
  const charity = items.filter((item) => item.category === 'charity')

  return (
    <div>
      <PageHero
        eyebrow={rewardsHero.eyebrow}
        title={
          <>
            {rewardsHero.titleLead} <span className="text-accent-deep">{rewardsHero.titleAccent}</span>
          </>
        }
        description={rewardsHero.description}
      >
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {rewardsHero.pills.map((pill) => (
            <span key={pill} className="rounded-full bg-white px-4 py-2 text-sm text-ink-soft shadow-soft">
              {pill}
            </span>
          ))}
        </div>
      </PageHero>

      {user && !loading && !error ? (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 rounded-[1.6rem] border border-brand/15 bg-brand-soft/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted uppercase">Available points</p>
              <p className="font-display mt-1 text-3xl text-ink">{formatNumber(points)}</p>
            </div>
            <p className="max-w-md text-sm leading-6 text-ink-soft">
              Browse options here, then open{' '}
              <Link to={paths.redeemRewards} className="font-medium text-brand hover:underline">
                Redeem Rewards
              </Link>{' '}
              to submit a payout. Track status in Reward History.
            </p>
          </div>
          {message ? (
            <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success" role="status">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="px-4 pt-12 sm:px-6 lg:px-8">
        <SectionHeading
          title="Browse Reward Categories"
          description="Popular rewards from the Tremendous catalog. Only options that can be delivered to your country are shown."
        />
        <div className="mx-auto mt-8 max-w-sm">
          <label htmlFor="rewards-country" className="mb-2 block text-center text-sm text-ink-soft">
            Showing rewards available in
          </label>
          <RewardCountrySelect id="rewards-country" value={country} onValueChange={setCountry} />
        </div>
      </section>

      {loading ? (
        <div className="mx-auto max-w-6xl px-4 py-10">
          <LoadingSkeleton rows={4} />
        </div>
      ) : null}
      {error ? (
        <div className="mx-auto max-w-6xl px-4 py-10">
          <ErrorState message="Unable to load rewards. Please try again." onRetry={reload} />
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          {cash.length === 0 && giftCards.length === 0 && charity.length === 0 ? (
            <div className="mx-auto max-w-6xl px-4 py-10">
              <EmptyState
                title={`No rewards available in ${recipientCountry}`}
                description="None of the panel’s reward options can be delivered to this country right now. Choose another country above, or check back later."
              />
            </div>
          ) : null}
          {cash.length ? (
            <RewardCategorySection
              title={rewardShowcase[0].title}
              description={rewardShowcase[0].description}
              rewards={cash}
              redeemTo={redeemTo}
              featuredId="paypal"
              onRedeem={user ? setSelected : undefined}
            />
          ) : null}
          {giftCards.length ? (
            <RewardCategorySection
              title={rewardShowcase[1].title}
              description={rewardShowcase[1].description}
              rewards={giftCards}
              redeemTo={redeemTo}
              onRedeem={user ? setSelected : undefined}
            />
          ) : null}
          {charity.length ? (
            <RewardCategorySection
              title={rewardShowcase[2].title}
              description={rewardShowcase[2].description}
              rewards={charity}
              redeemTo={redeemTo}
              onRedeem={user ? setSelected : undefined}
            />
          ) : null}
        </>
      ) : null}

      <RewardBenefits />

      {data?.guide ? (
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-4 rounded-[1.6rem] border border-brand/15 bg-brand-soft/50 px-6 py-8 sm:grid-cols-3 sm:px-8">
            <div className="text-center">
              <p className="font-display text-3xl text-brand">{formatNumber(data.guide.minimumRedemption)}</p>
              <p className="mt-1 text-sm text-ink-soft">Minimum payout points</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl text-brand">{formatNumber(items.length)}</p>
              <p className="mt-1 text-sm text-ink-soft">Options in {recipientCountry}</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl text-brand">0%</p>
              <p className="mt-1 text-sm text-ink-soft">Member signup fees</p>
            </div>
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-5 text-muted">{data.guide.body}</p>
        </section>
      ) : null}

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            title="Frequently Asked Questions"
            description="Everything you need to know about redeeming your rewards. Exact values still come from each reward option."
          />
          <FaqAccordion
            className="mt-10"
            items={rewardsFaqs.map((item) =>
              item.q.includes('minimum') && data?.guide.minimumRedemption
                ? {
                    ...item,
                    a: `You can request a payout once your available balance reaches ${formatNumber(data.guide.minimumRedemption)} points. The same minimum applies to every payout option.`,
                  }
                : item,
            )}
          />
        </div>
      </section>

      <CtaSection
        title={
          <>
            {rewardsCta.titleLead} <span className="text-accent">{rewardsCta.titleAccent}</span>
          </>
        }
        description={
          user
            ? 'Your points stay on your member account. Redeem when you are ready, or return to your dashboard for activity and history.'
            : rewardsCta.description
        }
        primary={user ? { to: paths.dashboard, label: 'Go to Dashboard' } : { to: paths.join, label: rewardsCta.primary }}
        secondary={
          user ? { to: paths.history, label: 'View History' } : { to: paths.howItWorks, label: rewardsCta.secondary }
        }
      />

      {selected ? (
        <RedeemDialog
          key={selected.id}
          reward={selected}
          methods={methods}
          points={points}
          heldPoints={data?.heldPoints ?? 0}
          minimum={minimum}
          onClose={() => setSelected(null)}
          onSubmitted={(name) => {
            setMessage(`${name} request submitted.`)
            reload()
          }}
        />
      ) : null}
    </div>
  )
}
