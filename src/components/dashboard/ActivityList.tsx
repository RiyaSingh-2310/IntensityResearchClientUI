import { CheckCircle2, Coins, Gift, Sparkles } from 'lucide-react'
import type { ActivityItem } from '@/types/panelist'
import { formatRelativeTime } from '@/lib/utils'

const icons = {
  points: Coins,
  reward: Gift,
  project: Sparkles,
  profile: CheckCircle2,
}

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <ol className="mt-5 space-y-4">
      {items.map((item) => {
        const Icon = icons[item.kind] ?? Sparkles
        return (
          <li key={item.id} className="flex items-start gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-surface text-accent shadow-soft">
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium leading-5 text-ink">{item.title}</p>
              <p className="mt-0.5 text-sm leading-6 text-ink-soft">{item.detail}</p>
              <p className="mt-1 text-xs text-muted">{formatRelativeTime(item.occurredAt)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
