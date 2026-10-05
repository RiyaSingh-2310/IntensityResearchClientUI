import type { RewardCategory, RewardRequestStatus, TransactionType } from './common'

/** A payout method enabled by the API, shaped for display. */
export interface RewardOption {
  /** API payment method id. */
  id: string
  /** Display name (e.g. "UPI" for the API's "UIP"). */
  name: string
  /** Raw API name, sent back as `payment_method` when redeeming. */
  apiValue: string
  category: RewardCategory
  description: string
  pointsRequired: number
}

export interface RedeemRewardPayload {
  rewardId: string
  rewardName: string
  rewardPoints: number
  paymentMethod?: string
  remark?: string
}

export interface RewardRequest {
  id: string
  rewardId: string
  rewardName: string
  category: RewardCategory
  pointsUsed: number
  requestedAt: string
  status: RewardRequestStatus
  paymentMethod?: string
  remark?: string | null
  comment?: string | null
  processedAt?: string | null
}

export interface RewardTransaction {
  id: string
  rewardName: string
  points: number
  occurredAt: string
  type: TransactionType
  status: RewardRequestStatus | 'posted'
  category?: RewardCategory
}

export interface RewardHistoryQuery {
  status?: string
  type?: string
  from?: string
  to?: string
}
