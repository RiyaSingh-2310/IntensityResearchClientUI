import { CheckCircle2, Gift, Monitor, UserRound } from 'lucide-react'
import { contactTips, quickHelpTopics } from '@/content/contact'

const topicIcons = {
  user: UserRound,
  gift: Gift,
  monitor: Monitor,
}

export function ContactSidebar() {
  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-lg font-semibold text-strong">What we can help with</h3>
        <ul className="mt-5 space-y-4">
          {quickHelpTopics.map((item) => {
            const Icon = topicIcons[item.icon]
            return (
              <li key={item.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{item.copy}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-signal/25 bg-signal-soft/60 p-6">
        <h3 className="font-display text-lg font-semibold text-strong">Before you send</h3>
        <ul className="mt-4 space-y-2">
          {contactTips.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
