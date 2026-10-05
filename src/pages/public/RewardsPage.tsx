import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RewardBenefits } from '@/components/rewards/RewardBenefits'
import { RedeemDialog } from '@/components/rewards/RedeemDialog'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { CtaSection } from '@/components/shared/CtaSection'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { PageHero } from '@/components/shared/PageHero'
import { RewardCard } from '@/components/shared/RewardCard'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { rewardSteps, rewardsCta, rewardsFaqs, rewardsHero } from '@/content/rewards'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
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
  const [selected, setSelected] = useState<RewardOption | null>(null)
  const [message, setMessage] = useState('')
  const items = data?.items ?? []
  const points = data?.balancePoint ?? 0
  const held = data?.heldPoints ?? 0
  const minimum = data?.minimumPayout ?? 0
  const welcomePoints = data?.registrationRewardPoints ?? 0

  return (
    <div>
      <PageHero
        eyebrow={rewardsHero.eyebrow}
        title={
          <>
            {rewardsHero.titleLead} <span className="text-accent">{rewardsHero.titleAccent}</span>
          </>
        }
        description={rewardsHero.description}
      >
        <ul className="mt-8 flex flex-wrap justify-center gap-2">
          {rewardsHero.pills.map((pill) => (
            <li key={pill} className="rounded-full border border-line bg-surface/80 px-4 py-2 text-sm text-ink-soft">
              {pill}
            </li>
          ))}
        </ul>
      </PageHero>

      {user && !loading && !error ? (
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-brand-mid/30 bg-brand-soft/60 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">Available points</p>
              <p className="font-display mt-1 text-3xl font-semibold text-strong">{formatNumber(points)}</p>
              {held > 0 ? (
                <p className="mt-1 text-xs text-ink-soft">{formatNumber(held)} points held by pending requests</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link to={paths.redeemRewards}>Redeem points</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={paths.history}>View history</Link>
              </Button>
            </div>
          </div>
          {message ? (
            <p className="mt-4 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success" role="status">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Payout methods"
          title="Ways to redeem your points"
          description="These options come straight from the panel’s current payout settings."
        />

        {loading ? (
          <div className="mt-10">
            <LoadingSkeleton rows={3} />
          </div>
        ) : null}
        {error ? (
          <div className="mt-10">
            <ErrorState message="Unable to load payout methods. Please try again." onRetry={reload} />
          </div>
        ) : null}

        {!loading && !error ? (
          items.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  action={
                    user ? (
                      <Button type="button" className="w-full" onClick={() => setSelected(reward)}>
                        Redeem with {reward.name}
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full">
                        <Link to={paths.join}>Join to redeem</Link>
                      </Button>
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-10">
              <EmptyState
                title="No payout methods are enabled right now."
                description="Payout methods will appear here as soon as they are enabled. Your points stay safely in your balance."
              />
            </div>
          )
        ) : null}

        {!loading && !error && minimum > 0 ? (
          <dl className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface px-6 py-5">
              <dt className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Minimum payout</dt>
              <dd className="font-display mt-2 text-3xl font-semibold text-strong">{formatNumber(minimum)} points</dd>
            </div>
            <div className="rounded-2xl border border-line bg-surface px-6 py-5">
              <dt className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                {welcomePoints > 0 ? 'Welcome points' : 'Payout methods'}
              </dt>
              <dd className="font-display mt-2 text-3xl font-semibold text-strong">
                {welcomePoints > 0 ? `${formatNumber(welcomePoints)} points` : formatNumber(items.length)}
              </dd>
              {welcomePoints > 0 ? (
                <p className="mt-1 text-xs text-ink-soft">Credited according to the panel’s registration settings.</p>
              ) : null}
            </div>
          </dl>
        ) : null}
      </section>

      <section className="border-y border-line bg-cream/60 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="How redemption works" title="From points to payout in three steps" />
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {rewardSteps.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-line bg-surface px-6 py-6">
                <span className="font-display grid size-9 place-items-center rounded-full border border-signal/40 bg-signal-soft text-sm font-semibold text-signal">
                  {index + 1}
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold text-strong">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-ink-soft">{step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <RewardBenefits />

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading title="Rewards FAQ" description="Quick answers about earning and redeeming points." />
          <FaqAccordion className="mt-10" items={rewardsFaqs} />
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
            ? 'Your points stay on your member account. Redeem when you are ready, or head to your dashboard for new surveys.'
            : rewardsCta.description
        }
        primary={user ? { to: paths.dashboard, label: 'Go to dashboard' } : { to: paths.join, label: rewardsCta.primary }}
        secondary={
          user ? { to: paths.surveys, label: 'View my surveys' } : { to: paths.howItWorks, label: rewardsCta.secondary }
        }
      />

      {selected ? (
        <RedeemDialog
          key={selected.id}
          reward={selected}
          methods={items}
          points={points}
          heldPoints={held}
          minimum={minimum}
          onClose={() => setSelected(null)}
          onSubmitted={(name) => {
            setMessage(`Your ${name} request was submitted and is pending review.`)
            reload()
          }}
        />
      ) : null}
    </div>
  )
}
