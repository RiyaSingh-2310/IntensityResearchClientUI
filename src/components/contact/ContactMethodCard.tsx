import { CircleHelp, Globe, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cardLiftClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

const icons = {
  mail: Mail,
  globe: Globe,
  help: CircleHelp,
}

export function ContactMethodCard({
  title,
  copy,
  detail,
  cta,
  href,
  icon,
  onAction,
  accent,
  hoverAccent,
}: {
  title: string
  copy: string
  detail: string
  cta: string
  href?: string | null
  icon: keyof typeof icons
  onAction?: () => void
  accent?: boolean
  hoverAccent?: boolean
}) {
  const Icon = icons[icon]
  const className = cn(
    'group flex h-full min-w-0 w-full flex-col rounded-2xl border border-line bg-surface p-6 text-center hover:border-brand-mid/50',
    cardLiftClass,
    accent && 'border-brand-mid/40 bg-brand-soft/40',
    hoverAccent && 'hover:bg-brand-soft/50',
  )

  const action = (
    <span
      className={cn(
        'mt-auto flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors duration-200',
        accent ? 'border border-brand bg-brand text-white' : 'border border-line bg-raised text-ink',
        hoverAccent && 'group-hover:border-brand group-hover:bg-brand group-hover:text-white',
      )}
    >
      {cta}
    </span>
  )

  const body = (
    <>
      <span className="mx-auto grid size-14 shrink-0 place-items-center rounded-2xl border border-brand-mid/30 bg-brand-soft text-accent transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-xl font-semibold text-strong">{title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-ink-soft">{copy}</p>
      <p className="mt-4 min-h-12 flex-1 text-sm leading-6 font-medium break-words whitespace-pre-line text-ink">
        {detail}
      </p>
      {action}
    </>
  )

  if (href?.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {body}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={className} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>
        {body}
      </a>
    )
  }

  return (
    <button type="button" className={className} onClick={onAction}>
      {body}
    </button>
  )
}
