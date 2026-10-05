import { ClipboardList, Gift, History, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/config/paths'
import { cardLiftClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

const actions = [
  { to: paths.surveys, label: 'My surveys', copy: 'Open studies assigned to your account.', icon: ClipboardList },
  { to: paths.redeemRewards, label: 'Redeem points', copy: 'Request a payout with your available points.', icon: Gift },
  { to: paths.history, label: 'History', copy: 'See payout requests and points earned.', icon: History },
  { to: paths.settings, label: 'Profile & settings', copy: 'Keep your account details up to date.', icon: UserRound },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => (
        <Link key={action.to} to={action.to} className="block h-full">
          <Card className={cn('h-full transition-colors hover:border-brand-mid/50', cardLiftClass)}>
            <CardContent className="flex h-full items-start gap-3 pt-5 sm:gap-4 sm:pt-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent sm:size-11">
                <action.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-strong">{action.label}</h3>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{action.copy}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
