import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { NumericInput } from '@/components/ui/numeric-input'
import { RewardMethodSelect } from '@/components/rewards/RewardMethodSelect'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { countryName } from '@/content/countries'
import { redemptionRemark, type RewardMethod } from '@/content/rewardMethods'
import { asNumber, formatNumber } from '@/lib/utils'
import { ApiRequestError } from '@/services/errors'
import { rewardService } from '@/services/reward.service'
import type { RewardOption } from '@/types/reward'

export function RedeemDialog({
  reward,
  methods,
  points,
  heldPoints = 0,
  minimum,
  onClose,
  onSubmitted,
}: {
  reward: RewardOption
  /** Rewards available in the recipient's country; `reward` is preselected. */
  methods: RewardMethod[]
  points: number
  /** Points reserved by pending requests; the API rejects requests above points minus these. */
  heldPoints?: number
  minimum: number
  onClose: () => void
  onSubmitted: (name: string) => void
}) {
  const [methodId, setMethodId] = useState(() => reward.id)
  const [redeemPoints, setRedeemPoints] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)
  const [errorMessage, setErrorMessage] = useState('')
  const enteredPoints = redeemPoints === '' ? 0 : asNumber(redeemPoints)
  const noBalance = points <= 0
  const redeemable = Math.max(points - heldPoints, 0)
  const remaining = Math.max(points - enteredPoints, 0)
  const pointsError = noBalance
    ? ''
    : redeemPoints === ''
      ? ''
      : enteredPoints > redeemable
        ? redeemable < points
          ? `Enter no more than ${formatNumber(redeemable)} points. ${formatNumber(heldPoints)} points are held by pending requests.`
          : `Enter no more than ${formatNumber(points)} points.`
        : enteredPoints < minimum
          ? `Enter at least ${formatNumber(minimum)} points.`
          : ''
  const canRedeem =
    !noBalance &&
    redeemPoints !== '' &&
    enteredPoints >= minimum &&
    enteredPoints <= redeemable &&
    redeemable >= minimum
  const selectedMethod = methods.find((method) => method.id === methodId)

  async function confirmRedeem() {
    if (inFlight.current || !canRedeem) return
    if (!selectedMethod) {
      setErrorMessage('Select a reward method to continue.')
      return
    }
    inFlight.current = true
    setSubmitting(true)
    setErrorMessage('')
    try {
      await rewardService.redeem({
        rewardId: reward.id,
        rewardName: selectedMethod.name,
        rewardPoints: asNumber(redeemPoints),
        paymentMethod: selectedMethod.apiValue,
        remark: redemptionRemark(selectedMethod),
      })
      onSubmitted(selectedMethod.name)
      onClose()
    } catch (error) {
      setErrorMessage(error instanceof ApiRequestError ? error.message : 'Unable to submit this request.')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(nextOpen) => { if (!nextOpen) onClose() }}>
      <DialogContent title="Request this reward" description="Choose a payout method and points before you submit.">
        {errorMessage ? (
          <p className="mb-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="grid gap-4">
          <dl className="grid gap-3 rounded-2xl border border-line bg-white px-4 py-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Catalog item</dt>
              <dd className="font-medium text-ink">{reward.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Current balance</dt>
              <dd className="font-medium text-ink">{formatNumber(points)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Remaining balance</dt>
              <dd className="font-medium text-ink">{formatNumber(remaining)}</dd>
            </div>
            {selectedMethod ? (
              <>
                <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
                  <dt className="text-muted">Payout method</dt>
                  <dd className="flex min-w-0 items-center gap-2 font-medium text-ink">
                    <RewardMethodMark method={selectedMethod} size="sm" decorative />
                    <span className="truncate">{selectedMethod.name}</span>
                  </dd>
                </div>
                {selectedMethod.countryCode ? (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted">Reward country</dt>
                    <dd className="text-right font-medium text-ink">
                      {countryName(selectedMethod.countryCode) || selectedMethod.countryCode}
                    </dd>
                  </div>
                ) : null}
              </>
            ) : null}
          </dl>

          <Field label="Reward method" htmlFor="reward-method">
            <RewardMethodSelect
              id="reward-method"
              value={methodId}
              onValueChange={setMethodId}
              methods={methods}
              disabled={submitting || noBalance}
            />
          </Field>

          <Field
            label="Points to redeem"
            htmlFor="redeem-points"
            hint={
              noBalance
                ? 'No available balance'
                : redeemable < points
                  ? `Minimum: ${formatNumber(minimum)} · Available to redeem: ${formatNumber(redeemable)}`
                  : `Minimum: ${formatNumber(minimum)}`
            }
            error={pointsError || undefined}
          >
            <NumericInput
              id="redeem-points"
              integer
              maxDigits={8}
              value={noBalance ? 0 : redeemPoints}
              disabled={noBalance || submitting}
              placeholder={noBalance ? '0 points available' : undefined}
              onValueChange={(value) => {
                if (noBalance) return
                setRedeemPoints(value === '' ? '' : asNumber(value))
              }}
            />
          </Field>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-soft">
          Submitting creates a pending request. You can follow approval, rejection, or completion in History.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void confirmRedeem()} disabled={submitting || !canRedeem || !selectedMethod}>
            {submitting ? 'Submitting…' : 'Submit request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
