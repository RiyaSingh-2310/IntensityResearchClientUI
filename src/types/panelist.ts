import type { OnboardingAnswer, OnboardingStepGroup, Panelist } from './api'

export interface DashboardSummary {
  availablePoints: number
  redeemedPoints: number
  pendingRequests: number
  assignedProjects: number
  nextRewardAt: number
  pointsThisMonth: number
}

export interface ActivityItem {
  id: string
  title: string
  detail: string
  occurredAt: string
  kind: 'project' | 'reward' | 'points' | 'profile'
}

export interface ProfilePageData {
  user: Panelist
  steps: OnboardingStepGroup[]
  answers: OnboardingAnswer[]
}

export interface ProfileUpdatePayload {
  name?: string
  phone?: string
}
