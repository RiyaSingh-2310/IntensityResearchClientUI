import { AlertCircle, Inbox, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-28 w-full" />
      ))}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-brand-mid/30 bg-brand-soft text-accent">
        <Inbox className="size-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-semibold text-strong">{title}</h3>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft/60 px-6 py-12 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-surface text-danger">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-semibold text-strong">Unable to load this section</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">{message}</p>
      <Button className="mt-5" variant="outline" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  )
}
