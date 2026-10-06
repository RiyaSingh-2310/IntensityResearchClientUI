import { Clock, Gift, Target } from 'lucide-react'
import { motion } from 'motion/react'
import { joinHero } from '@/config/brand'
import { useMotionConfig } from '@/lib/motion'

const highlightIcons = [Target, Clock, Gift]

export function JoinHero() {
  const { duration } = useMotionConfig()

  return (
    <section className="relative overflow-hidden bg-brand-deep">
      <motion.div
        className="relative mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:py-16"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration }}
      >
        <p className="text-xs font-semibold tracking-[0.22em] text-accent uppercase">{joinHero.eyebrow}</p>
        <h1 className="font-display mt-4 text-4xl leading-tight text-white text-balance sm:text-5xl">{joinHero.title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">{joinHero.body}</p>
        <ol className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {joinHero.highlights.map((item, index) => {
            const Icon = highlightIcons[index] ?? Gift
            return (
              <li key={item.title} className="text-center">
                <Icon className="mx-auto size-6 text-accent" aria-hidden="true" />
                <p className="font-display mt-2 text-2xl leading-tight text-white text-balance sm:text-[1.65rem]">{item.title}</p>
                <p className="mt-1 text-sm text-white/70">{item.copy}</p>
              </li>
            )
          })}
        </ol>
        <p className="mx-auto mt-8 max-w-xl text-xs leading-5 text-white/55">{joinHero.disclaimer}</p>
      </motion.div>
    </section>
  )
}
