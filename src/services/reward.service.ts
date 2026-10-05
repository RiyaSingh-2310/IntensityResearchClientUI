import type { PublicSettings, RewardBalance, RewardRequestRecord, RewardTransactionRecord } from '@/types/api'
import type { RedeemRewardPayload, RewardOption, RewardRequest } from '@/types/reward'
import { rewardOptionForName, toRewardOptions } from '@/lib/paymentMethods'
import { asNumber } from '@/lib/utils'
import { mapRewardRequest, unwrapCollection } from '@/lib/apiMap'
import { apiRequest } from './http'

export interface RewardCatalogResponse {
  /** Payout methods enabled by the API. */
  items: RewardOption[]
  minimumPayout: number
  /** Points credited at registration (public settings), when configured. */
  registrationRewardPoints: number
  balancePoint?: number
  /** Points reserved by pending payout requests. */
  heldPoints?: number
}

function getSettings() {
  return apiRequest<PublicSettings>('/settings', { auth: false })
}

export const rewardService = {
  getSettings,
  async getCatalog(): Promise<RewardCatalogResponse> {
    const settings = await getSettings()
    const minimum = asNumber(settings.minimum_payout)
    return {
      items: toRewardOptions(settings.payment_methods, minimum),
      minimumPayout: minimum,
      registrationRewardPoints: asNumber(settings.registration_reward_points),
    }
  },
  getBalance() {
    return apiRequest<RewardBalance>('/rewards/balance')
  },
  async getMemberCatalog(): Promise<RewardCatalogResponse> {
    const [balance, settings, requests] = await Promise.all([
      apiRequest<RewardBalance>('/rewards/balance'),
      getSettings().catch(() => null),
      apiRequest<unknown>('/rewards/requests').then((data) =>
        unwrapCollection<RewardRequestRecord>(data, ['requests', 'items']),
      ),
    ])
    const minimum = asNumber(balance.minimum_payout ?? settings?.minimum_payout)
    return {
      items: toRewardOptions(balance.payment_methods ?? settings?.payment_methods, minimum),
      minimumPayout: minimum,
      registrationRewardPoints: asNumber(settings?.registration_reward_points),
      balancePoint: asNumber(balance.balance_point),
      heldPoints: requests
        .filter((item) => item.status === 'pending')
        .reduce((sum, item) => sum + asNumber(item.reward_points), 0),
    }
  },
  getTransactions() {
    return apiRequest<unknown>('/rewards/transactions').then((data) =>
      unwrapCollection<RewardTransactionRecord>(data, ['transactions', 'items']),
    )
  },
  /** POST /rewards/requests. The API accepts `payment_method` and its legacy spelling `payment_methord`. */
  async redeem(payload: RedeemRewardPayload): Promise<RewardRequest> {
    const method = payload.paymentMethod ?? payload.rewardName
    const data = await apiRequest<RewardRequestRecord & { request?: RewardRequestRecord }>('/rewards/requests', {
      method: 'POST',
      body: {
        reward_points: payload.rewardPoints,
        payment_method: method,
        payment_methord: method,
        remark: payload.remark ?? payload.rewardName,
      },
    })
    const record = data?.request ?? data
    if (record?.id) return mapRewardRequest(record)
    const option = rewardOptionForName(method)
    return {
      id: payload.rewardId,
      rewardId: payload.rewardId,
      rewardName: option.name,
      category: option.category,
      pointsUsed: payload.rewardPoints,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      paymentMethod: method,
    }
  },
}
