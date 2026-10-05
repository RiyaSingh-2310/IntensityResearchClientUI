import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { RewardMethodSelect } from '@/components/rewards/RewardMethodSelect'
import { RewardRequestHistoryList } from '@/components/rewards/RewardRequestHistoryList'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { paths } from '@/config/paths'
import { useAsync } from '@/hooks/useAsync'
import { toRewardOptions } from '@/lib/paymentMethods'
import { asNumber, formatNumber } from '@/lib/utils'
import { ApiRequestError } from '@/services/errors'
import { rewardRequestService } from '@/services/rewardRequest.service'
import { rewardService } from '@/services/reward.service'

export function RedeemRewardsPage() {
  const balance = useAsync(() => rewardService.getBalance())
  const history = useAsync(() => rewardRequestService.list())
  const methods = useMemo(
    () => toRewardOptions(balance.data?.payment_methods, balance.data?.minimum_payout),
    [balance.data?.payment_methods, balance.data?.minimum_payout],
  )
  const [methodId, setMethodId] = useState('')
  const [points, setPoints] = useState<number | ''>('')
  const [remark, setRemark] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const available = asNumber(balance.data?.balance_point)
  const minimum = asNumber(balance.data?.minimum_payout)
  const requests = history.data?.items ?? []
  const historyReady = Boolean(history.data) && !history.loading
  const pendingRequests = requests.filter((item) => item.status === 'pending')
  const completedRequests = requests.filter((item) => item.status === 'completed' || item.status === 'approved')
  const pendingPoints = pendingRequests.reduce((sum, item) => sum + asNumber(item.pointsUsed), 0)
  // The API holds points in pending requests and rejects requests above balance minus pending.
  const redeemable = history.data ? Math.max(available - pendingPoints, 0) : available
  const resolvedMethodId =
    methodId && methods.some((method) => method.id === methodId) ? methodId : methods[0]?.id ?? ''
  const selected = methods.find((method) => method.id === resolvedMethodId)
  const pointsValue = points === '' ? 0 : asNumber(points)
  const noBalance = available <= 0
  const pointsError = noBalance
    ? ''
    : points === ''
      ? ''
      : pointsValue > redeemable
        ? redeemable < available
          ? `Enter no more than ${formatNumber(redeemable)} points. ${formatNumber(pendingPoints)} points are held by pending requests.`
          : `Enter no more than ${formatNumber(available)} points.`
        : pointsValue < minimum
          ? `Enter at least ${formatNumber(minimum)} points.`
          : ''
  const canSubmit =
    !noBalance &&
    Boolean(selected) &&
    points !== '' &&
    pointsValue >= minimum &&
    pointsValue <= redeemable &&
    redeemable >= minimum

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selected || !canSubmit || inFlight.current) return
    inFlight.current = true
    setSubmitting(true)
    setFormError('')
    setSuccessMessage('')
    try {
      await rewardService.redeem({
        rewardId: selected.id,
        rewardName: selected.name,
        rewardPoints: pointsValue,
        paymentMethod: selected.apiValue,
        remark: remark.trim() || selected.name,
      })
      setSuccessMessage(`Your ${selected.name} request for ${formatNumber(pointsValue)} points was submitted.`)
      setPoints('')
      setRemark('')
      balance.reload()
      history.reload()
    } catch (error) {
      setFormError(error instanceof ApiRequestError ? error.message : 'Unable to submit this request.')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  const loading = balance.loading && !balance.data
  const error = balance.error

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Member rewards</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-strong sm:text-5xl">Redeem rewards</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            Choose a payout method, enter the points you want to redeem, and submit a request. Every request is reviewed,
            and its status appears in your redemption history below.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {loading ? <LoadingSkeleton rows={4} /> : null}
        {error ? <ErrorState message="Unable to load your reward balance." onRetry={balance.reload} /> : null}

        {!loading && !error ? (
          <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grid content-start gap-4">
              <div className="surface-gradient rounded-2xl border border-brand-mid/30 px-6 py-6 shadow-glow">
                <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">Available balance</p>
                <p className="font-display mt-2 text-4xl font-semibold text-strong">
                  {formatNumber(available)} <span className="text-base font-medium text-ink-soft">points</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  {noBalance
                    ? 'Complete eligible surveys to start earning points.'
                    : redeemable >= minimum
                      ? `You can redeem up to ${formatNumber(redeemable)} points now.`
                      : `You need ${formatNumber(Math.max(minimum - redeemable, 0))} more redeemable points to reach the minimum payout.`}{' '}
                  <Link to={paths.rewards} className="font-medium text-accent hover:underline">
                    About payout methods
                  </Link>
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-surface px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Minimum</dt>
                  <dd className="font-display mt-1 text-2xl font-semibold text-strong">{formatNumber(minimum)}</dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">Points needed to request a payout</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Payout methods</dt>
                  <dd className="font-display mt-1 text-2xl font-semibold text-strong">{formatNumber(methods.length)}</dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">Options enabled for your account</p>
                </div>
                <div className="rounded-2xl border border-line bg-surface px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">In review</dt>
                  <dd className="font-display mt-1 text-2xl font-semibold text-strong">
                    {historyReady ? formatNumber(pendingPoints) : history.error ? '—' : '…'}
                  </dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">
                    {historyReady
                      ? `${formatNumber(pendingRequests.length)} pending ${pendingRequests.length === 1 ? 'request' : 'requests'}`
                      : history.error
                        ? 'Requests unavailable'
                        : 'Loading your requests'}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-surface px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Completed</dt>
                  <dd className="font-display mt-1 text-2xl font-semibold text-strong">
                    {historyReady ? formatNumber(completedRequests.length) : history.error ? '—' : '…'}
                  </dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">Approved or completed payouts</p>
                </div>
              </dl>
            </div>

            <form
              className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6"
              onSubmit={onSubmit}
              noValidate
            >
              <h2 className="font-display text-2xl font-semibold text-strong">Redemption request</h2>
              <p className="mt-1 text-sm text-ink-soft">Select a payout method, then enter your points.</p>

              {formError ? (
                <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
                  {formError}
                </p>
              ) : null}
              {successMessage ? (
                <p className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-sm text-success" role="status">
                  {successMessage}
                </p>
              ) : null}

              {!methods.length ? (
                <EmptyState
                  title="No payout methods available"
                  description="Payout methods will appear here when they are enabled. Your points stay in your balance."
                />
              ) : (
                <div className="mt-5 grid gap-4">
                  <Field label="Payout method" htmlFor="redeem-method" required>
                    <RewardMethodSelect
                      id="redeem-method"
                      value={resolvedMethodId}
                      onValueChange={setMethodId}
                      methods={methods}
                      disabled={submitting || noBalance}
                    />
                  </Field>
                  <Field
                    label="Points to redeem"
                    htmlFor="redeem-amount"
                    required
                    hint={
                      noBalance
                        ? 'No available balance'
                        : redeemable < available
                          ? `Minimum: ${formatNumber(minimum)} · Available to redeem: ${formatNumber(redeemable)}`
                          : `Minimum: ${formatNumber(minimum)}`
                    }
                    error={pointsError || undefined}
                  >
                    <NumericInput
                      id="redeem-amount"
                      integer
                      maxDigits={8}
                      value={noBalance ? 0 : points}
                      disabled={noBalance || submitting}
                      placeholder={noBalance ? '0 points available' : undefined}
                      onValueChange={(value) => {
                        if (noBalance) return
                        setPoints(value === '' ? '' : asNumber(value))
                      }}
                    />
                  </Field>
                  <Field label="Remark (optional)" htmlFor="redeem-remark">
                    <Input
                      id="redeem-remark"
                      value={remark}
                      disabled={noBalance || submitting}
                      onChange={(event) => setRemark(event.target.value)}
                      placeholder="Optional note for this request"
                      maxLength={200}
                    />
                  </Field>
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" asChild>
                      <Link to={paths.history}>View full history</Link>
                    </Button>
                    <Button type="submit" disabled={submitting || !canSubmit}>
                      {submitting ? 'Submitting…' : 'Submit redemption'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </section>
        ) : null}

        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">Activity</p>
              <h2 className="font-display mt-1 text-3xl font-semibold text-strong">Redemption history</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                Requests from your account. The status updates once our team reviews the payout.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={paths.history}>Open full history</Link>
            </Button>
          </div>

          {history.loading && !history.data ? <LoadingSkeleton rows={3} /> : null}
          {history.error ? <ErrorState message="Unable to load reward history." onRetry={history.reload} /> : null}
          {history.data && !history.error ? (
            <RewardRequestHistoryList items={history.data?.items ?? []} />
          ) : null}
        </section>
      </div>
    </div>
  )
}
