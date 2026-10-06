import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/PageState'
import { RequestStatusBadge } from '@/components/shared/StatusBadge'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/config/paths'
import { resolveRequestMethod } from '@/content/rewardMethods'
import { formatDate, formatNumber } from '@/lib/utils'
import type { RewardRequest } from '@/types/reward'

export function RewardRequestHistoryList({
  items,
  emptyActionTo = paths.redeemRewards,
  emptyActionLabel = 'Redeem Rewards',
}: {
  items: RewardRequest[]
  emptyActionTo?: string
  emptyActionLabel?: string
}) {
  if (!items.length) {
    return (
      <EmptyState
        title="No reward requests yet."
        description="When you submit a redemption, the request and its status will appear here."
        action={
          <Button asChild>
            <Link to={emptyActionTo}>{emptyActionLabel}</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="grid gap-3">
      {items.map((item) => {
        const method = resolveRequestMethod(item.paymentMethod, item.remark)
        return (
          <Card key={item.id}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                {method ? <RewardMethodMark method={method} size="md" decorative /> : null}
                <div className="min-w-0">
                  <h2 className="font-display text-xl text-ink sm:text-2xl">{method?.name ?? item.rewardName}</h2>
                  <p className="mt-1 text-sm text-ink-soft">
                    {formatNumber(item.pointsUsed)} points · Requested {formatDate(item.requestedAt)}
                  </p>
                  {item.processedAt ? (
                    <p className="mt-0.5 text-xs text-muted">Processed {formatDate(item.processedAt)}</p>
                  ) : null}
                  {item.remark ? <p className="mt-2 text-sm text-ink-soft">Remark: {item.remark}</p> : null}
                  {item.comment ? <p className="mt-1 text-sm text-muted">{item.comment}</p> : null}
                </div>
              </div>
              <RequestStatusBadge status={item.status} />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
