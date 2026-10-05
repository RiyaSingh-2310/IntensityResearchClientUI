import type { PaginatedResponse } from '@/types/common'
import type { RewardRequestRecord } from '@/types/api'
import type { RewardHistoryQuery, RewardRequest, RewardTransaction } from '@/types/reward'
import { mapRewardRequest, mapTransaction, unwrapCollection } from '@/lib/apiMap'
import { parseApiDate } from '@/lib/utils'
import { apiRequest } from './http'
import { rewardService } from './reward.service'

function matchesDate(value: string, from?: string, to?: string) {
  if (!from && !to) return true
  const time = parseApiDate(value).getTime()
  if (from && time < new Date(`${from}T00:00:00`).getTime()) return false
  if (to && time > new Date(`${to}T23:59:59`).getTime()) return false
  return true
}

export const rewardRequestService = {
  listRecords() {
    return apiRequest<unknown>('/rewards/requests').then((data) =>
      unwrapCollection<RewardRequestRecord>(data, ['requests', 'items']),
    )
  },
  async list(): Promise<PaginatedResponse<RewardRequest>> {
    const items = (await rewardRequestService.listRecords()).map(mapRewardRequest)
    return { items, total: items.length }
  },
  async history(query: RewardHistoryQuery = {}): Promise<PaginatedResponse<RewardTransaction>> {
    const records = await rewardService.getTransactions()
    const items = records
      .map(mapTransaction)
      .filter((item) => {
        if (query.status && query.status !== 'all' && item.status !== query.status) return false
        if (query.type && query.type !== 'all' && item.type !== query.type) return false
        return matchesDate(item.occurredAt, query.from, query.to)
      })
    return { items, total: items.length }
  },
}
