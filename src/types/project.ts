import type { SurveyAssignmentStatus } from './api'

export type RewardCreditState = 'pending' | 'credited' | 'not_eligible'

export interface AssignedProject {
  id: string
  name: string
  description: string
  assignedAt: string
  status: SurveyAssignmentStatus | string
  points: number | null
  surveyUrl: string | null
  completedAt: string | null
  rewardStatus: RewardCreditState
}

export interface ProjectQuery {
  sort?: 'assignedAt:desc' | 'assignedAt:asc'
  page?: number
  limit?: number
  status?: SurveyAssignmentStatus
}
