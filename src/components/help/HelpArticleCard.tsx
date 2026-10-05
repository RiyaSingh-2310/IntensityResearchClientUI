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
    <article className="flex items-start gap-3 rounded-xl border border-line/60 bg-cream px-3 py-3">
      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-raised text-accent">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h4 className="text-sm font-semibold text-ink">{title}</h4>
        <p className="mt-0.5 text-sm leading-6 text-ink-soft">{copy}</p>
      </div>
    </article>
  )
}
