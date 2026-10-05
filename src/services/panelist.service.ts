import type { RewardBalance, RewardRequestRecord, RewardTransactionRecord } from '@/types/api'
import type { ActivityItem, DashboardSummary, ProfilePageData } from '@/types/panelist'
import type { AssignedProject } from '@/types/project'
import { mapTransaction, paymentMethodName } from '@/lib/apiMap'
import { asNumber, parseApiDate } from '@/lib/utils'
import { authService } from './auth.service'
import { onboardingService } from './onboarding.service'
import { projectService } from './project.service'
import { rewardRequestService } from './rewardRequest.service'
import { rewardService } from './reward.service'

export interface DashboardResponse {
  summary: DashboardSummary
  activity: ActivityItem[]
  latestProjects: AssignedProject[]
}

function requestTitle(status: string) {
  if (status === 'pending') return 'Reward requested'
  if (status === 'approved') return 'Reward approved'
  if (status === 'completed') return 'Reward redeemed'
  if (status === 'rejected') return 'Reward request declined'
  return 'Reward update'
}

export function activityFromData(
  transactions: RewardTransactionRecord[],
  requests: RewardRequestRecord[],
): ActivityItem[] {
  const fromTransactions: ActivityItem[] = transactions.map((item) => {
    const mapped = mapTransaction(item)
    const earned = mapped.type !== 'redeemed'
    return {
      id: `tx-${item.id}`,
      title: earned ? 'Points earned' : 'Reward redeemed',
      detail: earned
        ? `${mapped.points} points added${item.remark ? ` · ${item.remark}` : ''}`
        : `${Math.abs(mapped.points)} points used${item.remark ? ` · ${item.remark}` : ''}`,
      occurredAt: item.created_at,
      kind: earned ? 'points' : 'reward',
    }
  })

  const fromRequests: ActivityItem[] = requests.map((item) => ({
    id: `req-${item.id}`,
    title: requestTitle(item.status),
    detail: `${paymentMethodName(item)} · ${asNumber(item.reward_points)} points`,
    occurredAt: item.created_at,
    kind: 'reward',
  }))

  return [...fromTransactions, ...fromRequests]
    .sort((a, b) => parseApiDate(b.occurredAt).getTime() - parseApiDate(a.occurredAt).getTime())
    .slice(0, 6)
}

export const panelistService = {
  async getProfile(): Promise<ProfilePageData> {
    const [user, questions, answers] = await Promise.all([
      authService.me(),
      onboardingService.getQuestions(),
      onboardingService.getAnswers(),
    ])
    return {
      user,
      steps: questions.steps,
      answers: answers.answers ?? [],
    }
  },
  updateProfile(payload: { name?: string; phone?: string }) {
    return authService.updateMe(payload)
  },
  async getDashboard(): Promise<DashboardResponse> {
    const [balance, tx, requests, projects] = await Promise.all([
      rewardService.getBalance(),
      rewardService.getTransactions(),
      rewardRequestService.listRecords(),
      projectService.getAssigned({ sort: 'assignedAt:desc' }),
    ])
    return composeDashboard(balance, tx, requests, projects.items)
  },
}

export function composeDashboard(
  balance: RewardBalance,
  transactions: RewardTransactionRecord[],
  requests: RewardRequestRecord[],
  projects: AssignedProject[] = [],
): DashboardResponse {
  const now = new Date()
  const redeemedPoints = transactions
    .filter((item) => item.transaction_type === 'debit')
    .reduce((sum, item) => sum + asNumber(item.reward_points), 0)
  const pointsThisMonth = transactions
    .filter((item) => {
      if (item.transaction_type !== 'credit') return false
      const date = parseApiDate(item.created_at)
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
    })
    .reduce((sum, item) => sum + asNumber(item.reward_points), 0)
  const openProjects = projects.filter((item) => item.status === 'active')

  return {
    summary: {
      availablePoints: asNumber(balance.balance_point),
      redeemedPoints,
      pendingRequests: requests.filter((item) => item.status === 'pending').length,
      assignedProjects: openProjects.length,
      nextRewardAt: asNumber(balance.minimum_payout) || 1,
      pointsThisMonth,
    },
    activity: activityFromData(transactions, requests),
    latestProjects: openProjects.length ? openProjects.slice(0, 3) : projects.slice(0, 3),
  }
}
