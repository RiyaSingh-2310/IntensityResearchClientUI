import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { AssignedSurveyCard } from '@/components/surveys/AssignedSurveyCard'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { useAsync } from '@/hooks/useAsync'
import { countByStatus, filterByStatus, ongoingFirst, surveyFilters, type SurveyFilter } from '@/lib/projects'
import { cn, formatNumber } from '@/lib/utils'
import { projectService } from '@/services/project.service'

const emptyCopy: Record<SurveyFilter, { title: string; description: string }> = {
  all: {
    title: 'No surveys assigned yet',
    description: 'When a survey is assigned to your account, it will show up here so you can start it right away.',
  },
  active: {
    title: 'No ongoing surveys',
    description: 'You are all caught up. New surveys will appear here as soon as they are assigned to you.',
  },
  complete: { title: 'No completed surveys yet', description: 'Surveys you complete will be listed here.' },
  terminate: { title: 'No terminated surveys', description: 'Surveys that ended early because you did not qualify appear here.' },
  quota_full: {
    title: 'No quota-full surveys',
    description: 'Surveys that closed because enough responses were collected appear here.',
  },
}

export function ProjectsPage() {
  const { data, loading, error, reload } = useAsync(() => projectService.getAssigned({ sort: 'assignedAt:desc' }), 'assigned-surveys')
  const [filter, setFilter] = useState<SurveyFilter>('all')
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') reload()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reload])

  const items = data?.items ?? []
  const counts = countByStatus(items)
  const visible = filter === 'all' ? ongoingFirst(items) : filterByStatus(items, filter)
  const earned = items
    .filter((item) => item.status === 'complete')
    .reduce((sum, item) => sum + (item.points ?? 0), 0)

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = {
      ArrowRight: (index + 1) % surveyFilters.length,
      ArrowLeft: (index - 1 + surveyFilters.length) % surveyFilters.length,
      Home: 0,
      End: surveyFilters.length - 1,
    }
    const next = keys[event.key]
    if (next === undefined) return
    event.preventDefault()
    setFilter(surveyFilters[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Assigned to you</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-strong sm:text-5xl">My surveys</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            Surveys assigned to your account appear here. Ongoing surveys are listed first — select{' '}
            <span className="font-semibold text-ink">Continue survey</span> to open one in a new tab.
          </p>
          {data ? (
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Assigned', value: counts.all },
                { label: 'Ongoing', value: counts.active },
                { label: 'Completed', value: counts.complete },
                { label: 'Points from completed', value: earned },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-line bg-surface/80 px-4 py-4">
                  <dt className="text-xs text-muted">{stat.label}</dt>
                  <dd className="font-display mt-1 text-2xl font-semibold text-strong">{formatNumber(stat.value)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        {loading && !data ? <LoadingSkeleton rows={4} /> : null}
        {error ? <ErrorState message={error} onRetry={reload} /> : null}

        {data ? (
          <>
            <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div role="tablist" aria-label="Filter surveys by status" className="inline-flex min-w-max gap-1 rounded-2xl border border-line bg-surface p-1">
                {surveyFilters.map((item, index) => {
                  const selected = filter === item.id
                  return (
                    <button
                      key={item.id}
                      ref={(node) => {
                        tabRefs.current[index] = node
                      }}
                      type="button"
                      role="tab"
                      id={`survey-tab-${item.id}`}
                      aria-selected={selected}
                      aria-controls="survey-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setFilter(item.id)}
                      onKeyDown={(event) => onTabKeyDown(event, index)}
                      className={cn(
                        'inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-medium whitespace-nowrap transition-colors',
                        selected ? 'bg-brand text-white shadow-glow' : 'text-ink-soft hover:bg-raised hover:text-ink',
                      )}
                    >
                      {item.label}
                      <span
                        className={cn(
                          'min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold',
                          selected ? 'bg-white/20 text-white' : 'bg-raised text-ink-soft',
                        )}
                      >
                        {formatNumber(counts[item.id])}
                        <span className="sr-only"> surveys</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div id="survey-panel" role="tabpanel" aria-labelledby={`survey-tab-${filter}`} className="space-y-4">
              {visible.length === 0 ? (
                <EmptyState title={emptyCopy[filter].title} description={emptyCopy[filter].description} />
              ) : (
                visible.map((project) => <AssignedSurveyCard key={project.id} project={project} />)
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
