import { CheckCircle2, Gift, Mail, Monitor, UserRound } from 'lucide-react'
import { brand } from '@/config/brand'
import { contactTips, quickHelpTopics } from '@/content/contact'

const topicIcons = {
  user: UserRound,
  gift: Gift,
  monitor: Monitor,
}

export function ContactSidebar() {
  return (
    <aside className="space-y-4">
      <section className="rounded-[1.6rem] border border-line bg-white p-6 shadow-card">
        <h3 className="flex items-center gap-2 font-display text-xl text-ink">
          <Mail className="size-5 text-brand" />
          Email Support
        </h3>
        <p className="mt-1 text-sm text-ink-soft">The panel team replies to every message by email</p>
        <a href={`mailto:${brand.email}`} className="mt-5 inline-flex text-sm font-medium text-brand break-all hover:underline">
          {brand.email}
        </a>
      </section>

      <section className="rounded-[1.6rem] border border-line bg-white p-6 shadow-card">
        <h3 className="font-display text-xl text-ink">Quick Help Topics</h3>
        <ul className="mt-5 space-y-4">
          {quickHelpTopics.map((item) => {
            const Icon = topicIcons[item.icon]
            return (
              <li key={item.title} className="flex gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-4" />
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

      <section className="rounded-[1.6rem] border border-success/20 bg-success-soft/60 p-6">
        <h3 className="font-display text-xl text-ink">Before You Send</h3>
        <ul className="mt-4 space-y-2">
          {contactTips.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
