import {
  Ban,
  CheckCircle2,
  CircleDot,
  CircleSlash,
  Clock3,
  PlayCircle,
  ThumbsUp,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SurveyAssignmentStatus } from '@/types/api'
import type { RewardCreditState } from '@/types/project'

type Tone = 'info' | 'success' | 'muted' | 'danger' | 'warning' | 'default'

const projectTone: Record<SurveyAssignmentStatus, Tone> = {
  active: 'info',
  complete: 'success',
  terminate: 'danger',
  quota_full: 'muted',
}

const requestTone: Record<string, Tone> = {
  pending: 'warning',
  approved: 'info',
  rejected: 'danger',
  completed: 'success',
  posted: 'default',
}

const statusLabels: Record<string, string> = {
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

const icons: Record<string, LucideIcon> = {
  active: PlayCircle,
  complete: CheckCircle2,
  terminate: XCircle,
  quota_full: CircleSlash,
  pending: Clock3,
  credited: CheckCircle2,
  not_eligible: Ban,
  approved: ThumbsUp,
  rejected: XCircle,
  completed: CheckCircle2,
  posted: CircleDot,
}

function label(status: string) {
  return statusLabels[status] ?? status.replaceAll('_', ' ')
}

function StatusBadge({ status, tone }: { status: string; tone: Tone }) {
  const Icon = icons[status] ?? CircleDot
  return (
    <Badge tone={tone}>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label(status)}
    </Badge>
  )
}

export function ProjectStatusBadge({ status }: { status: string }) {
  const tone = status in projectTone ? projectTone[status as SurveyAssignmentStatus] : 'muted'
  return <StatusBadge status={status} tone={tone} />
}

export function RewardStatusBadge({ status }: { status: RewardCreditState }) {
  const tone = status === 'credited' ? 'success' : status === 'not_eligible' ? 'muted' : 'warning'
  return <StatusBadge status={status} tone={tone} />
}

export function RequestStatusBadge({ status }: { status: string }) {
  return <StatusBadge status={status} tone={requestTone[status] ?? 'default'} />
}
