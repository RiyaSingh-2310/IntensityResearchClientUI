import type { RewardCategory } from '@/types/common'

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
  if (value.includes('paypal') || value === 'cash' || value.includes('bank')) return 'cash'
  if (value.includes('gift') || value.includes('amazon') || value.includes('flipkart') || value.includes('voucher')) {
    return 'gift-card'
  }
  if (value.includes('charity') || value.includes('donate')) return 'charity'
  return 'digital'
}
