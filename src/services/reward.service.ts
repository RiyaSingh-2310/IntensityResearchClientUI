import type { PanelPayoutConfig } from '@/content/rewardMethods'
import type { PublicSettings, RewardBalance, RewardRequestRecord, RewardTransactionRecord } from '@/types/api'
import type { PointsGuide, RedeemRewardPayload, RewardRequest } from '@/types/reward'
import { displayPaymentMethodName, paymentMethodCategory } from '@/lib/paymentMethods'
import { asNumber } from '@/lib/utils'
import { mapRewardRequest, unwrapCollection } from '@/lib/apiMap'
import { apiRequest } from './http'

export interface RewardCatalogResponse {
  /** Payout methods and switches enabled on the panel; rewards are resolved per recipient country. */
  payout: PanelPayoutConfig
  guide: PointsGuide
  /** Points credited at registration (public settings), when configured. */
  registrationRewardPoints: number
  balancePoint?: number
  /** Points reserved by pending payout requests. */
  heldPoints?: number
}

function getSettings() {
  return apiRequest<PublicSettings>('/settings', { auth: false })
}

function guideFromMinimum(minimum: number): PointsGuide {
  return {
    headline: 'Redemption minimum',
    body: 'Point requirements come from the current payout settings. Each request is reviewed before it is paid.',
    minimumRedemption: minimum,
    notes: [],
  }
}

function payoutConfig(methods: PublicSettings['payment_methods'] | undefined, settings?: PublicSettings | null): PanelPayoutConfig {
  return {
    methods: methods ?? [],
    settings: settings
      ? { paypal_enabled: settings.paypal_enabled, amazon_enabled: settings.amazon_enabled, flipkart_enabled: settings.flipkart_enabled }
      : null,
  }
}

export const rewardService = {
  getSettings,
  async getCatalog(): Promise<RewardCatalogResponse> {
    const settings = await getSettings()
    const minimum = asNumber(settings.minimum_payout)
    return {
      payout: payoutConfig(settings.payment_methods, settings),
      guide: guideFromMinimum(minimum),
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
      payout: payoutConfig(balance.payment_methods ?? settings?.payment_methods, settings),
      guide: guideFromMinimum(minimum),
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
    return {
      id: payload.rewardId,
      rewardId: payload.rewardId,
      rewardName: payload.rewardName || displayPaymentMethodName(method),
      category: paymentMethodCategory(method),
      pointsUsed: payload.rewardPoints,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      paymentMethod: method,
    }
  },
}
