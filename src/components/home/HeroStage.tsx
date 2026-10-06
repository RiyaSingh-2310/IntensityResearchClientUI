import { motion } from 'motion/react'
import { Check, Sparkles, Wallet } from 'lucide-react'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { joinIncentive } from '@/config/brand'
import { showcaseRewardMethods } from '@/content/rewardMethods'
import { easePremium, useMotionConfig } from '@/lib/motion'

const journey = [
  { label: 'Opinion', detail: 'Share a response' },
  { label: 'Research', detail: 'Assigned in your portal' },
  { label: 'Points', detail: 'After the study is approved' },
  { label: 'Rewards', detail: 'PayPal, gift cards, or Visa' },
]

const previews = [
  { id: 'paypal', label: 'PayPal' },
  { id: 'amazon', label: 'Gift card' },
  { id: 'virtual-visa', label: 'Visa' },
]

export function HeroStage() {
  const { reduce } = useMotionConfig()
  const marks = previews.flatMap(({ id, label }) => {
    const method = showcaseRewardMethods.find((item) => item.id === id)
    return method ? [{ ...method, shortLabel: label }] : []
  })

  return (
    <motion.div
      className="relative"
      initial={reduce ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.1, ease: easePremium }}
    >
      <div className="relative grid items-center gap-3 lg:grid-cols-[10.5rem_minmax(0,1fr)]">
        <div className="order-2 grid grid-cols-2 gap-3 lg:order-1 lg:grid-cols-1">
          <article className="float-soft rounded-2xl border border-line/80 bg-white px-4 py-4 shadow-card">
            <p className="text-[11px] tracking-[0.16em] text-brand uppercase">Typical study</p>
            <p className="font-display mt-2 text-2xl leading-none text-ink">5–15 min</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
              <Check className="size-3.5 text-brand" /> Fits your day
            </p>
          </article>
          <article className="float-soft-late rounded-2xl border border-line/80 bg-white px-4 py-4 shadow-card">
            <p className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.16em] text-accent-deep uppercase">
              <Wallet className="size-3.5" /> Points
            </p>
            <p className="font-display mt-2 text-2xl leading-none text-ink">Ready to redeem</p>
            <p className="mt-2 text-xs text-muted">After approval</p>
          </article>
        </div>

        <article className="relative z-10 order-1 w-full rounded-[2rem] border border-white/80 bg-white/75 p-3 shadow-lift backdrop-blur-xl lg:order-2">
          <div className="rounded-[1.55rem] bg-ink px-5 py-6 text-cream sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] tracking-[0.22em] text-accent uppercase">Member welcome</p>
              <Sparkles className="size-4 text-accent" />
            </div>
            <h2 className="font-display mt-4 text-[2rem] leading-tight">{joinIncentive.label}</h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-cream/70">{joinIncentive.body}</p>
            <ol className="mt-6 space-y-0">
              {journey.map((step, index) => (
                <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < journey.length - 1 ? (
                    <span className="absolute top-5 left-[9px] h-[calc(100%-8px)] w-px bg-white/15" aria-hidden="true" />
                  ) : null}
                  <span className="relative z-10 mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-accent/70 bg-ink">
                    <span className="size-1.5 rounded-full bg-accent" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-cream">{step.label}</p>
                    <p className="text-xs text-cream/55">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </article>

        <article className="float-soft-slow order-3 rounded-2xl border border-line/80 bg-white px-4 py-3.5 shadow-card lg:col-span-2">
          <p className="text-[11px] tracking-[0.16em] text-muted uppercase">Payout options</p>
          <div className="mt-2.5 flex items-center gap-3">
            {marks.map((method) => (
              <span key={method.id} className="inline-flex items-center gap-2">
                <RewardMethodMark method={method} size="sm" />
                <span className="hidden text-xs font-medium text-ink sm:inline">{method.shortLabel ?? method.name}</span>
              </span>
            ))}
          </div>
        </article>
      </div>
    </motion.div>
  )
}
