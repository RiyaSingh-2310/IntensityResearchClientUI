import { ExternalLink } from 'lucide-react'
import { ProjectStatusBadge, RewardStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { getProjectAction } from '@/lib/projects'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { AssignedProject } from '@/types/project'

export function AssignedSurveyCard({ project, compact = false }: { project: AssignedProject; compact?: boolean }) {
  const action = getProjectAction(project)
  const ongoing = project.status === 'active'

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-surface px-5 py-5 transition-colors sm:px-6',
        ongoing ? 'border-brand-mid/40 hover:border-brand-mid/70' : 'border-line hover:border-ink/20',
      )}
    >
      {ongoing ? (
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand to-signal" />
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} />
            {project.assignedAt ? (
              <span className="text-xs text-muted">Assigned {formatDate(project.assignedAt)}</span>
            ) : null}
          </div>
          <h3
            className={cn(
              'font-display mt-2 font-semibold text-strong',
              compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
            )}
          >
            {project.name}
          </h3>
          {project.description ? <p className="mt-1 text-sm leading-6 text-ink-soft">{project.description}</p> : null}
          <dl className={cn('mt-3 grid gap-3 text-sm', compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4')}>
            {project.points != null ? (
              <div>
                <dt className="text-xs text-muted">Reward</dt>
                <dd className="mt-1 font-semibold text-signal">{formatNumber(project.points)} points</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-xs text-muted">Points status</dt>
              <dd className="mt-1">
                <RewardStatusBadge status={project.rewardStatus} />
              </dd>
            </div>
            {project.completedAt ? (
              <div>
                <dt className="text-xs text-muted">Completed</dt>
                <dd className="mt-1 font-medium text-ink">{formatDate(project.completedAt)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
        {action.href && !action.disabled ? (
          <Button asChild className="w-full shrink-0 sm:w-auto">
            <a href={action.href} target="_blank" rel="noreferrer">
              {action.label}
              <ExternalLink aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </Button>
        ) : (
          <Button variant="subtle" className="w-full shrink-0 sm:w-auto" disabled>
            {action.label}
          </Button>
        )}
      </div>
    </article>
  )
}
