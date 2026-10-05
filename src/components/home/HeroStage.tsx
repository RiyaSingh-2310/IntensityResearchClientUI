import { motion } from 'motion/react'
import { BellRing, Check, Sparkles, Wallet } from 'lucide-react'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { joinIncentive } from '@/config/brand'
import { easePremium, useMotionConfig } from '@/lib/motion'
import type { RewardOption } from '@/types/reward'

const journey = [
  { label: 'Join', detail: 'Create a free account and verify your email' },
  { label: 'Profile', detail: 'Answer a short set of profile questions' },
  { label: 'Surveys', detail: 'Assigned studies appear in your dashboard' },
  { label: 'Rewards', detail: 'Redeem points with an available payout method' },
]

export function HeroStage({ methods = [] }: { methods?: RewardOption[] }) {
  const { reduce } = useMotionConfig()

  return (
    <motion.div
      className="relative"
      initial={reduce ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.1, ease: easePremium }}
    >
      <div className="pointer-events-none absolute inset-x-8 top-10 bottom-8 rounded-[2.5rem] bg-brand/15 blur-3xl" aria-hidden="true" />
      <span className="float-soft pointer-events-none absolute top-6 right-[18%] size-2 rounded-full bg-signal" aria-hidden="true" />
      <span className="float-soft-late pointer-events-none absolute bottom-16 left-[12%] size-1.5 rounded-full bg-accent/70" aria-hidden="true" />

      <div className="relative grid items-center gap-3 lg:grid-cols-[10.5rem_minmax(0,1fr)]">
        <div className="order-2 grid grid-cols-2 gap-3 lg:order-1 lg:grid-cols-1">
          <article className="float-soft rounded-2xl border border-line bg-surface px-4 py-4 shadow-card">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-accent uppercase">
              <BellRing className="size-3.5" aria-hidden="true" /> Studies
            </p>
            <p className="font-display mt-2 text-xl leading-tight font-semibold text-strong">Matched to you</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
              <Check className="size-3.5 text-accent" aria-hidden="true" /> Based on your profile
            </p>
          </article>
          <article className="float-soft-late rounded-2xl border border-line bg-surface px-4 py-4 shadow-card">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.16em] text-signal uppercase">
              <Wallet className="size-3.5" aria-hidden="true" /> Points
            </p>
            <p className="font-display mt-2 text-xl leading-tight font-semibold text-strong">Tracked live</p>
            <p className="mt-2 text-xs text-muted">Balance and history in one place</p>
          </article>
        </div>

        <article className="glass-panel relative z-10 order-1 w-full rounded-[2rem] border border-line p-3 shadow-lift lg:order-2">
          <div className="surface-gradient rounded-[1.55rem] px-5 py-6 text-ink sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-signal uppercase">How it works</p>
              <Sparkles className="size-4 text-signal" aria-hidden="true" />
            </div>
            <h2 className="font-display mt-4 text-[2rem] leading-tight font-semibold text-strong">{joinIncentive.label}</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-ink-soft">{joinIncentive.body}</p>
            <ol className="mt-6">
              {journey.map((step, index) => (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < journey.length - 1 ? (
                    <span className="absolute top-5 left-[9px] h-[calc(100%-8px)] w-px bg-ink/15" aria-hidden="true" />
                  ) : null}
                  <span className="relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-signal/70 bg-night">
                    <span className="size-1.5 rounded-full bg-signal" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-strong">{step.label}</p>
                    <p className="text-xs text-ink-soft">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </article>

        {methods.length ? (
          <article className="float-soft-slow order-3 rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-card lg:col-span-2">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">Payout methods</p>
            <ul className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
              {methods.map((method) => (
                <li key={method.id} className="inline-flex items-center gap-2">
                  <RewardMethodMark method={method} size="sm" decorative />
                  <span className="text-xs font-medium text-ink">{method.name}</span>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </motion.div>
  )
}
