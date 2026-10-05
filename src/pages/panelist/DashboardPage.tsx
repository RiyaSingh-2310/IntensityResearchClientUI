import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, ClipboardList, Coins, Gift, Sparkles } from 'lucide-react'
import { ActivityList } from '@/components/dashboard/ActivityList'
import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { paths } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { useMotionConfig } from '@/lib/motion'
import { countByStatus, ongoingFirst } from '@/lib/projects'
import { formatNumber, givenName } from '@/lib/utils'
import { activityFromData, composeDashboard } from '@/services/panelist.service'
import { projectService } from '@/services/project.service'
import { rewardRequestService } from '@/services/rewardRequest.service'
import { rewardService } from '@/services/reward.service'

export function DashboardPage() {
  const { user } = useAuth()
  const { duration } = useMotionConfig()
  const balanceQuery = useAsync(() => rewardService.getBalance(), 'balance')
  const transactionsQuery = useAsync(() => rewardService.getTransactions(), 'transactions')
  const requestsQuery = useAsync(() => rewardRequestService.listRecords(), 'requests')
  const projectsQuery = useAsync(() => projectService.getAssigned(), 'projects')

  const reloadProjects = projectsQuery.reload
  const reloadBalance = balanceQuery.reload
  const balanceLoading = balanceQuery.loading && !balanceQuery.data
  const projectsLoading = projectsQuery.loading && !projectsQuery.data
  const activityLoading =
    (transactionsQuery.loading && !transactionsQuery.data) || (requestsQuery.loading && !requestsQuery.data)

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') {
        reloadProjects()
        reloadBalance()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reloadProjects, reloadBalance])

  const summary =
    balanceQuery.data &&
    composeDashboard(
      balanceQuery.data,
      transactionsQuery.data ?? [],
      requestsQuery.data ?? [],
      projectsQuery.data?.items ?? [],
    ).summary
  const activity = activityFromData(transactionsQuery.data ?? [], requestsQuery.data ?? [])
  const projects = projectsQuery.data?.items ?? []
  const remaining = summary ? Math.max(0, summary.nextRewardAt - summary.availablePoints) : 0
  const progress = summary
    ? Math.min(100, Math.round((summary.availablePoints / summary.nextRewardAt) * 100) || 0)
    : 0
  const readyToRedeem = Boolean(summary && summary.availablePoints >= summary.nextRewardAt)
  const onboardingIncomplete = Boolean(user && !user.onboarding_completed_at)

  const snapshot = summary
    ? [
        { label: 'Available points', value: formatNumber(summary.availablePoints), icon: Coins, tone: 'bg-signal-soft text-signal' },
        {
          label: 'Ongoing surveys',
          value: projectsQuery.data ? formatNumber(countByStatus(projects).active) : '—',
          icon: ClipboardList,
          tone: 'bg-brand-soft text-accent',
        },
        { label: 'Earned this month', value: formatNumber(summary.pointsThisMonth), icon: Sparkles, tone: 'bg-info-soft text-info' },
        { label: 'Pending redemptions', value: formatNumber(summary.pendingRequests), icon: Gift, tone: 'bg-warning-soft text-warning' },
      ]
    : []

  return (
    <div>
      <section className="hero-grid relative overflow-hidden px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <motion.div
          className="mx-auto max-w-6xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration }}
        >
          <Badge tone="signal">Member space</Badge>
          <h1 className="font-display mt-4 max-w-3xl text-3xl leading-[1.1] font-semibold text-strong sm:text-5xl">
            Welcome back, {givenName(user?.name)}.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-soft sm:mt-4 sm:text-lg sm:leading-8">
            Your surveys, points and redemption activity in one place.
          </p>
          {balanceLoading ? (
            <div className="mt-8">
              <LoadingSkeleton rows={1} />
            </div>
          ) : snapshot.length ? (
            <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {snapshot.map((item) => (
                <div key={item.label} className="glass-panel rounded-2xl border border-line p-4">
                  <span className={`grid size-9 place-items-center rounded-xl ${item.tone}`}>
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="font-display mt-3 text-2xl font-semibold text-strong sm:text-3xl">{item.value}</p>
                  <p className="mt-1 text-xs text-ink-soft">{item.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </motion.div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {onboardingIncomplete ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-signal/30 bg-signal-soft px-4 py-4 text-sm text-signal sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p>Finish your profile so we can match you with the most relevant opportunities.</p>
            <Button asChild size="sm" variant="signal" className="w-full sm:w-auto">
              <Link to={paths.settings}>Complete profile</Link>
            </Button>
          </div>
        ) : null}

        <AnimatedSection>
          {balanceLoading ? <LoadingSkeleton rows={1} /> : null}
          {balanceQuery.error ? (
            <ErrorState message="We couldn’t load your points." onRetry={balanceQuery.reload} />
          ) : null}
          {summary && !balanceLoading && !balanceQuery.error ? (
            <div className="surface-gradient rounded-[1.75rem] border border-brand-mid/30 p-5 text-ink shadow-glow sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.18em] text-signal uppercase">Available points</p>
                  <p className="font-display mt-3 text-5xl font-semibold text-strong sm:text-6xl">
                    <AnimatedCounter value={summary.availablePoints} />
                  </p>
                  <p className="mt-2 max-w-lg text-sm text-ink-soft">
                    {readyToRedeem
                      ? `You can request a payout. The current minimum is ${formatNumber(summary.nextRewardAt)} points.`
                      : `${formatNumber(remaining)} points until the current ${formatNumber(summary.nextRewardAt)}-point minimum.`}
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto">
                  <Link to={paths.redeemRewards}>
                    Redeem points
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
              <Progress className="mt-6 bg-ink/10" value={progress} aria-label="Progress toward the minimum payout" />
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div className="rounded-2xl bg-ink/5 px-3 py-3">
                  <dt className="text-[11px] text-muted">Redeemed</dt>
                  <dd className="mt-1 font-medium">{formatNumber(summary.redeemedPoints)}</dd>
                </div>
                <div className="rounded-2xl bg-ink/5 px-3 py-3">
                  <dt className="text-[11px] text-muted">Minimum</dt>
                  <dd className="mt-1 font-medium">{formatNumber(summary.nextRewardAt)}</dd>
                </div>
                <div className="col-span-2 rounded-2xl bg-ink/5 px-3 py-3 sm:col-span-1">
                  <dt className="text-[11px] text-muted">Pending requests</dt>
                  <dd className="mt-1 font-medium">{formatNumber(summary.pendingRequests)}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </AnimatedSection>

        <AnimatedSection delay={0.04}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-strong sm:text-3xl">Your surveys</h2>
              <p className="mt-1 text-sm text-ink-soft">
                {projects.length > 3
                  ? `Ongoing surveys first. All ${projects.length} assigned surveys are on your Surveys page.`
                  : 'Ongoing surveys first. Open Surveys to filter by status.'}
              </p>
            </div>
            <Link to={paths.surveys} className="text-sm font-medium text-accent hover:underline">
              See all surveys
            </Link>
          </div>
          {projectsLoading ? <LoadingSkeleton rows={2} /> : null}
          {projectsQuery.error ? (
            <ErrorState message="We couldn’t load your surveys." onRetry={projectsQuery.reload} />
          ) : null}
          {!projectsLoading && !projectsQuery.error && projects.length === 0 ? (
            <EmptyState
              title="No surveys assigned yet"
              description="When a survey is assigned to your account, it will show up here."
            />
          ) : null}
          {!projectsLoading && !projectsQuery.error && projects.length > 0 ? (
            <div className="grid gap-4">
              {ongoingFirst(projects).slice(0, 3).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </AnimatedSection>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          <AnimatedSection delay={0.06}>
            <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-strong sm:text-3xl">Recent activity</h2>
                <p className="mt-1 text-sm text-ink-soft">Points earned and redemption requests from your account.</p>
              </div>
              <Link to={paths.history} className="text-sm font-medium text-accent hover:underline">
                View history
              </Link>
            </div>
            {activityLoading ? <LoadingSkeleton rows={2} /> : null}
            {transactionsQuery.error || requestsQuery.error ? (
              <div className="mt-4">
                <ErrorState
                  message="We couldn’t load your activity."
                  onRetry={() => {
                    transactionsQuery.reload()
                    requestsQuery.reload()
                  }}
                />
              </div>
            ) : null}
            {!activityLoading && !transactionsQuery.error && !requestsQuery.error && activity.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title="No recent activity yet."
                  description="Completed surveys and redemption requests will appear here as they happen."
                />
              </div>
            ) : null}
            {!activityLoading && !transactionsQuery.error && !requestsQuery.error && activity.length > 0 ? (
              <ActivityList items={activity} />
            ) : null}
          </AnimatedSection>

          <AnimatedSection delay={0.08}>
            <div className="mb-1">
              <h2 className="font-display text-2xl font-semibold text-strong sm:text-3xl">Redeem your points</h2>
              <p className="mt-1 text-sm text-ink-soft">Turn your balance into a payout.</p>
            </div>
            <div className="mt-5 rounded-2xl border border-brand-mid/30 bg-brand-soft/50 p-5 sm:p-6">
              <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">Ready when you are</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                Choose a payout method, submit a request, then follow its status in your history.
              </p>
              <Button asChild className="mt-5 w-full sm:w-auto">
                <Link to={paths.redeemRewards}>Redeem points</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.1}>
          <div className="border-t border-line pt-8">
            <h2 className="font-display text-2xl font-semibold text-strong sm:text-3xl">Quick actions</h2>
            <p className="mt-1 mb-5 text-sm text-ink-soft">Move through your member area without extra menus.</p>
            <QuickActions />
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
