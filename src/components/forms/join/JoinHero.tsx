import { Clock, Gift, Target } from 'lucide-react'
import { motion } from 'motion/react'
import { joinHero } from '@/config/brand'
import { useMotionConfig } from '@/lib/motion'

const highlightIcons = [Target, Clock, Gift]

export function JoinHero() {
  const { duration } = useMotionConfig()

  return (
    <section className="hero-grid relative overflow-hidden border-b border-line">
      <motion.div
        className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:py-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration }}
      >
        <p className="text-xs font-semibold tracking-[0.22em] text-signal uppercase">{joinHero.eyebrow}</p>
        <h1 className="font-display mt-4 text-4xl leading-tight font-semibold text-strong text-balance sm:text-5xl">{joinHero.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">{joinHero.body}</p>
        <ol className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {joinHero.highlights.map((item, index) => {
            const Icon = highlightIcons[index] ?? Gift
            return (
              <li key={item.title} className="glass-panel rounded-2xl border border-line px-4 py-5 text-center">
                <span className="mx-auto grid size-10 place-items-center rounded-xl border border-signal/30 bg-signal-soft text-signal">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <p className="font-display mt-3 text-lg leading-tight font-semibold text-strong">{item.title}</p>
                <p className="mt-1 text-sm text-ink-soft">{item.copy}</p>
              </li>
            )
          })}
        </ol>
        <p className="mx-auto mt-8 max-w-xl text-xs leading-5 text-muted">{joinHero.disclaimer}</p>
      </motion.div>
    </section>
  )
}
