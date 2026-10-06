import { Badge } from '@/components/ui/badge'
import type { SurveyAssignmentStatus } from '@/types/api'
import type { RewardCreditState } from '@/types/project'

const projectTone: Record<SurveyAssignmentStatus, 'info' | 'success' | 'muted' | 'danger'> = {
  active: 'info',
  complete: 'success',
  terminate: 'danger',
  quota_full: 'muted',
}

const requestTone: Record<string, 'warning' | 'info' | 'danger' | 'success' | 'default' | 'muted'> = {
  pending: 'warning',
  approved: 'info',
  rejected: 'danger',
  completed: 'success',
  posted: 'default',
}

const labels: Record<string, string> = {
  active: 'Ongoing',
  complete: 'Completed',
  terminate: 'Terminated',
  quota_full: 'Quota full',
  pending: 'Pending',
  credited: 'Credited',
  not_eligible: 'Not eligible',
  approved: 'Approved',
  rejected: 'Rejected',
  posted: 'Posted',
  completed: 'Completed',
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const tone = status in projectTone ? projectTone[status as SurveyAssignmentStatus] : 'muted'
  return <Badge tone={tone}>{labels[status] ?? status.replaceAll('_', ' ')}</Badge>
}

export function RewardStatusBadge({ status }: { status: RewardCreditState }) {
  const tone = status === 'credited' ? 'success' : status === 'not_eligible' ? 'muted' : 'warning'
  return <Badge tone={tone}>{labels[status] ?? status}</Badge>
}

export function RequestStatusBadge({ status }: { status: string }) {
  return <Badge tone={requestTone[status] ?? 'default'}>{labels[status] ?? status}</Badge>
}
