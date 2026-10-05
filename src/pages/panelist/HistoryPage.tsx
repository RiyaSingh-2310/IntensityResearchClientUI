import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RewardRequestHistoryList } from '@/components/rewards/RewardRequestHistoryList'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { RequestStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/config/paths'
import { useAsync } from '@/hooks/useAsync'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { rewardRequestService } from '@/services/rewardRequest.service'

type HistoryTab = 'rewards' | 'earnings'

export function HistoryPage() {
  const [tab, setTab] = useState<HistoryTab>('rewards')
  const requests = useAsync(() => rewardRequestService.list())
  const earnings = useAsync(() => rewardRequestService.history())

  const loading = (requests.loading && !requests.data) || (earnings.loading && !earnings.data)
  const error = requests.error || earnings.error
  const reload = () => {
    requests.reload()
    earnings.reload()
  }

  const rewardItems = requests.data?.items ?? []
  const earningItems = (earnings.data?.items ?? []).filter((item) => item.type === 'earned' || item.type === 'bonus')

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Your activity</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-strong sm:text-5xl">History</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            Review your payout requests and the points you have earned.
          </p>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to={paths.redeemRewards}>Redeem points</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full overflow-x-auto rounded-full border border-line bg-surface p-1 shadow-soft sm:inline-flex sm:w-auto">
          {(
            [
              { id: 'rewards', label: 'Payout requests' },
              { id: 'earnings', label: 'Points earned' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'min-w-0 flex-1 rounded-full px-3 py-2 text-xs whitespace-nowrap transition-all duration-200 sm:flex-none sm:px-4 sm:text-sm',
                tab === item.id ? 'bg-raised font-semibold text-strong shadow-soft' : 'text-ink-soft hover:text-ink',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {loading ? <LoadingSkeleton rows={4} /> : null}
          {error ? <ErrorState message="Unable to load your history." onRetry={reload} /> : null}

          {!loading && !error && tab === 'rewards' ? (
            <RewardRequestHistoryList
              items={rewardItems}
              emptyActionTo={paths.redeemRewards}
              emptyActionLabel="Redeem points"
            />
          ) : null}

          {!loading && !error && tab === 'earnings' ? (
            earningItems.length === 0 ? (
              <EmptyState
                title="No points history yet."
                description="Credited points will show up here once they are available for your account."
              />
            ) : (
              <div className="grid gap-3">
                {earningItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="font-display text-2xl text-ink">{item.rewardName}</h2>
                        <p className="mt-1 text-sm text-ink-soft">
                          {formatNumber(item.points)} points earned · {formatDate(item.occurredAt)}
                        </p>
                      </div>
                      <RequestStatusBadge status={item.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
