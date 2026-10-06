import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { RewardCountrySelect } from '@/components/rewards/RewardCountrySelect'
import { RewardMethodSelect } from '@/components/rewards/RewardMethodSelect'
import { RewardRequestHistoryList } from '@/components/rewards/RewardRequestHistoryList'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { NumericInput } from '@/components/ui/numeric-input'
import { paths } from '@/config/paths'
import { countryName } from '@/content/countries'
import { describeRewardMethod, redemptionRemark, rewardMethodsForCountry } from '@/content/rewardMethods'
import { useAsync } from '@/hooks/useAsync'
import { useRewardCountry } from '@/hooks/useRewardCountry'
import { asNumber, formatNumber } from '@/lib/utils'
import { ApiRequestError } from '@/services/errors'
import { rewardRequestService } from '@/services/rewardRequest.service'
import { rewardService } from '@/services/reward.service'

export function RedeemRewardsPage() {
  const balance = useAsync(() => rewardService.getBalance())
  const settings = useAsync(() => rewardService.getSettings().catch(() => null), 'redeem-settings')
  const history = useAsync(() => rewardRequestService.list())
  const [country, setCountry] = useRewardCountry()
  const methods = useMemo(
    () =>
      rewardMethodsForCountry(country, {
        methods: balance.data?.payment_methods ?? settings.data?.payment_methods,
        settings: settings.data,
      }),
    [country, balance.data?.payment_methods, settings.data],
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
  const selected = methods.find((method) => method.id === resolvedMethodId) ?? methods[0]
  const recipientCountry = countryName(country) || country
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
        remark: redemptionRemark(selected, remark),
      })
      setSuccessMessage(
        `Your ${selected.name} request for ${formatNumber(pointsValue)} points was submitted.`,
      )
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

  const loading = (balance.loading && !balance.data) || (settings.loading && !settings.data)
  const error = balance.error

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">Member rewards</p>
          <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">Redeem Rewards</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            Choose a payout method, enter the points you want to redeem, and submit a request. Approved payouts appear
            in your reward history below.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        {loading ? <LoadingSkeleton rows={4} /> : null}
        {error ? <ErrorState message="Unable to load your reward balance." onRetry={balance.reload} /> : null}

        {!loading && !error ? (
          <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="grid content-start gap-4">
              <div className="rounded-[1.6rem] border border-brand/15 bg-brand-soft/40 px-6 py-6">
                <p className="text-xs tracking-[0.16em] text-muted uppercase">Available balance</p>
                <p className="font-display mt-2 text-4xl text-ink">{formatNumber(available)}</p>
                <p className="mt-3 text-sm leading-6 text-ink-soft">
                  Points you can use toward a payout. Browse the{' '}
                  <Link to={paths.rewards} className="font-medium text-brand hover:underline">
                    rewards catalog
                  </Link>{' '}
                  for option details.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-white px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Minimum</dt>
                  <dd className="font-display mt-1 text-2xl text-ink">{formatNumber(minimum)}</dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">Points needed to request a payout</p>
                </div>
                <div className="rounded-2xl border border-line bg-white px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Reward options</dt>
                  <dd className="font-display mt-1 text-2xl text-ink">{formatNumber(methods.length)}</dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">Available in {recipientCountry}</p>
                </div>
                <div className="rounded-2xl border border-line bg-white px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">In review</dt>
                  <dd className="font-display mt-1 text-2xl text-ink">
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
                <div className="rounded-2xl border border-line bg-white px-4 py-4">
                  <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Completed</dt>
                  <dd className="font-display mt-1 text-2xl text-ink">
                    {historyReady ? formatNumber(completedRequests.length) : history.error ? '—' : '…'}
                  </dd>
                  <p className="mt-1 text-xs leading-5 text-ink-soft">Approved or completed payouts</p>
                </div>
              </dl>
            </div>

            <form
              className="rounded-[1.6rem] border border-line bg-white p-5 shadow-card sm:p-6"
              onSubmit={onSubmit}
              noValidate
            >
              <h2 className="font-display text-2xl text-ink">Redemption request</h2>
              <p className="mt-1 text-sm text-ink-soft">Select a reward method, then confirm your points.</p>

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

              <Field
                label="Reward country"
                htmlFor="redeem-country"
                required
                hint="Only rewards that can be delivered in this country are listed."
                className="mt-5"
              >
                <RewardCountrySelect
                  id="redeem-country"
                  value={country}
                  onValueChange={(code) => {
                    setCountry(code)
                    setMethodId('')
                  }}
                  disabled={submitting}
                />
              </Field>

              {!methods.length ? (
                <EmptyState
                  title={`No rewards available in ${recipientCountry}`}
                  description="None of the panel’s reward options can be delivered to this country right now. Choose another country if you live elsewhere, or contact support."
                />
              ) : (
                <div className="mt-4 grid gap-4">
                  <Field label="Reward method" htmlFor="redeem-method" required>
                    <RewardMethodSelect
                      id="redeem-method"
                      value={resolvedMethodId}
                      onValueChange={setMethodId}
                      methods={methods}
                      disabled={submitting || noBalance}
                    />
                  </Field>
                  {selected ? (
                    <p className="rounded-2xl border border-line bg-cream/60 px-4 py-3 text-sm leading-6 text-ink-soft">
                      {describeRewardMethod(selected)}
                    </p>
                  ) : null}
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
                    <input
                      id="redeem-remark"
                      className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink shadow-soft focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:bg-cream disabled:text-muted"
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
              <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">Activity</p>
              <h2 className="font-display mt-1 text-3xl text-ink">Reward redemption history</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
                Live requests from your account. Status updates when an administrator reviews the payout.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={paths.history}>Open Reward History</Link>
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
