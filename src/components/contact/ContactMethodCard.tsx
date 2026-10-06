import { CircleHelp, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cardLiftClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

const icons = {
  mail: Mail,
  chat: MessageCircle,
  phone: Phone,
  map: MapPin,
  help: CircleHelp,
  globe: Globe,
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
    'group flex h-full min-w-0 w-full flex-col rounded-[1.6rem] border border-line bg-white p-6 text-center shadow-card',
    cardLiftClass,
    accent && 'border-brand/20 bg-brand-soft/30',
    hoverAccent && 'hover:border-brand/40 hover:bg-brand-soft/50',
  )

  const action = (
    <span
      className={cn(
        'mt-auto flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium transition-colors duration-200',
        accent ? 'border border-brand bg-brand text-white' : 'border border-line bg-white text-ink',
        hoverAccent && 'group-hover:border-brand group-hover:bg-brand group-hover:text-white',
      )}
    >
      {cta}
    </span>
  )

  const body = (
    <>
      <span className="mx-auto grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
        <Icon className="size-6" />
      </span>
      <h3 className="mt-5 font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 min-h-10 text-sm leading-5 text-ink-soft">{copy}</p>
      <p className={cn('mt-4 min-h-12 flex-1 text-sm leading-6 font-medium break-words whitespace-pre-line', icon === 'chat' && accent ? 'text-success' : 'text-ink')}>
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
