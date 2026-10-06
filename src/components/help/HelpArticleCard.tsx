import {
  ClipboardList,
  Clock,
  Gift,
  KeyRound,
  LayoutDashboard,
  LineChart,
  PencilLine,
  Search,
  Shield,
  Truck,
  UserPlus,
  UserRoundCheck,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react'
import { cardLiftClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

const articleIcons = {
  user: UserPlus,
  clipboard: ClipboardList,
  layout: LayoutDashboard,
  badge: UserRoundCheck,
  search: Search,
  zap: Zap,
  chart: LineChart,
  clock: Clock,
  gift: Gift,
  wallet: Wallet,
  truck: Truck,
  wrench: Wrench,
  shield: Shield,
  pencil: PencilLine,
  key: KeyRound,
  users: Users,
}

export type HelpArticleIcon = keyof typeof articleIcons

export function HelpArticleCard({
  title,
  copy,
  icon,
}: {
  title: string
  copy: string
  icon: HelpArticleIcon
}) {
  const Icon = articleIcons[icon]

  return (
    <article
      className={cn(
        'group flex cursor-default items-start gap-3 rounded-2xl border border-transparent bg-white/70 px-3 py-3',
        cardLiftClass,
      )}
    >
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
        <Icon className="size-4" />
      </span>
      <div>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="mt-0.5 text-sm leading-6 text-ink-soft">{copy}</p>
      </div>
    </article>
  )
}
