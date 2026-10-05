import { Banknote, CreditCard, Gift, Smartphone, Wallet, type LucideIcon } from 'lucide-react'
import type { PaymentMethod } from '@/types/api'
import type { RewardCategory } from '@/types/common'
import type { RewardOption } from '@/types/reward'
import { asNumber } from './utils'

export const categoryLabels: Record<RewardCategory, string> = {
  cash: 'Cash payout',
  'gift-card': 'Gift card',
  digital: 'Digital payment',
}

function key(name: string) {
  return name.trim().toLowerCase()
}

/** Backend method names are shown as-is except known spellings (the API's "UIP" is UPI). */
export function displayPaymentMethodName(name: string) {
  const value = key(name)
  if (value === 'uip' || value === 'upi') return 'UPI'
  if (value === 'paypal') return 'PayPal'
  return name.trim() || 'Reward'
}

export function paymentMethodCategory(name: string): RewardCategory {
  const value = key(name)
  if (value === 'cash' || value.includes('bank')) return 'cash'
  if (value.includes('gift') || value.includes('voucher')) return 'gift-card'
  return 'digital'
}

export function paymentMethodIcon(name: string): LucideIcon {
  const value = key(name)
  if (value === 'uip' || value === 'upi') return Smartphone
  if (value.includes('paypal') || value.includes('wallet')) return Wallet
  const category = paymentMethodCategory(name)
  if (category === 'cash') return Banknote
  if (category === 'gift-card') return Gift
  return CreditCard
}

function describe(displayName: string, category: RewardCategory) {
  if (category === 'gift-card') return 'Redeem your points for a gift card. Card details are shared once your request is approved.'
  if (category === 'cash') return 'Redeem your points as a cash payout. Payout details are confirmed during review.'
  return `Receive your payout via ${displayName} once your request is approved.`
}

export function rewardOptionForName(name: string, minimum = 0, id?: string | number): RewardOption {
  const displayName = displayPaymentMethodName(name)
  const category = paymentMethodCategory(name)
  return {
    id: String(id ?? key(name)),
    name: displayName,
    apiValue: name.trim(),
    category,
    description: describe(displayName, category),
    pointsRequired: minimum,
  }
}

/** Payout options exactly as enabled by the API (`payment_methods`). */
export function toRewardOptions(methods: PaymentMethod[] | null | undefined, minimum: number | string | null | undefined) {
  const points = asNumber(minimum)
  return (methods ?? [])
    .filter((method) => method && typeof method.name === 'string' && method.name.trim())
    .map((method) => rewardOptionForName(method.name, points, method.id))
}
