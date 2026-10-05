import { Gift, HandHeart, ShieldCheck, Star, Target, Wallet, Search } from 'lucide-react'
import { brand, joinMemberTrust, joinResearchOpportunities, joinSidebarDisclaimer, joinWhyJoin } from '@/config/brand'

const benefitIcons = [Wallet, Search, ShieldCheck]
const trustIcons = [ShieldCheck, Target, Gift, HandHeart]

export function JoinSidebar() {
  return (
    <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
      <section className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-strong">
          <Star className="size-4 shrink-0 text-signal" aria-hidden="true" />
          Why join {brand.name}?
        </h2>
        <ul className="mt-5 space-y-4">
          {joinWhyJoin.map((item, index) => {
            const Icon = benefitIcons[index] ?? Star
            return (
              <li key={item.title} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{item.copy}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-brand-soft/70 p-5">
        <h2 className="text-sm font-semibold text-ink">Research opportunities</h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {joinResearchOpportunities.map((topic) => (
            <li key={topic} className="flex items-start gap-2 text-sm text-ink-soft">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              {topic}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-signal/30 bg-signal-soft p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldCheck className="size-4 shrink-0 text-signal" aria-hidden="true" />
          Why members trust {brand.name}
        </h2>
        <ul className="mt-4 space-y-3">
          {joinMemberTrust.map((item, index) => {
            const Icon = trustIcons[index] ?? ShieldCheck
            return (
              <li key={item.title} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-ink-soft">{item.copy}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="px-1 text-xs leading-5 text-muted">{joinSidebarDisclaimer}</p>
    </aside>
  )
}
