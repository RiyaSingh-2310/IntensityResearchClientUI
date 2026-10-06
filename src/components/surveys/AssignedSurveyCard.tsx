import { ExternalLink } from 'lucide-react'
import { ProjectStatusBadge, RewardStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cardLiftClass } from '@/lib/motion'
import { getProjectAction } from '@/lib/projects'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { AssignedProject } from '@/types/project'

export function AssignedSurveyCard({
  project,
  compact = false,
  latest = false,
}: {
  project: AssignedProject
  compact?: boolean
  latest?: boolean
}) {
  const action = getProjectAction(project)

  return (
    <Card className={cn(cardLiftClass)}>
      <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {latest ? (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent-deep uppercase">
                Latest
              </span>
            ) : null}
            <ProjectStatusBadge status={project.status} />
            {project.assignedAt ? <span className="text-xs text-muted">{formatDate(project.assignedAt)}</span> : null}
          </div>
          <h3 className={cn('font-display mt-2 text-ink', compact ? 'text-xl sm:text-2xl' : 'text-2xl')}>{project.name}</h3>
          {project.description ? <p className="mt-1 text-sm leading-6 text-ink-soft">{project.description}</p> : null}
          <dl className={cn('mt-3 grid gap-3 text-sm', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4')}>
            {project.points != null ? (
              <div>
                <dt className="text-xs text-muted">Reward</dt>
                <dd className="mt-1 font-medium text-brand">{formatNumber(project.points)} Points</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-muted">Reward status</dt>
              <dd className="mt-1">
                <RewardStatusBadge status={project.rewardStatus} />
              </dd>
            </div>
            {project.completedAt ? (
              <div>
                <dt className="text-xs text-muted">Completed</dt>
                <dd className="mt-1 font-medium">{formatDate(project.completedAt)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        {action.href && !action.disabled ? (
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <a href={action.href} target="_blank" rel="noreferrer">
              {action.label}
              <ExternalLink />
            </a>
          </Button>
        ) : (
          <Button className="w-full shrink-0 sm:w-auto" disabled>
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
