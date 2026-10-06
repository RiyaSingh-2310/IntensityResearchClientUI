import { describeRewardMethod, type RewardMethod } from '@/content/rewardMethods'
import type { RewardAvailability } from '@/types/common'
import type { RewardOption } from '@/types/reward'

export function getRewardAvailability(reward: RewardOption): RewardAvailability {
  if (reward.availability) return reward.availability
  return reward.available ? 'available' : 'coming-soon'
}

/** Card data for a reward already resolved for the recipient's country (so always available). */
export function rewardOptionFromMethod(method: RewardMethod, minimumPayout: number): RewardOption {
  return {
    id: method.id,
    name: method.name,
    category: method.category,
    description: describeRewardMethod(method),
    pointsRequired: minimumPayout,
    delivery: 'After approval',
    available: true,
    accent: '#2b322e',
    logoLabel: method.name.slice(0, 2).toUpperCase(),
    estimatedValueLabel: `${minimumPayout}+ points`,
    paymentMethod: method.apiValue,
    image: method.image,
  }
}
