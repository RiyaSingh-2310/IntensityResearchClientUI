import { ListChecks, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { motion } from 'motion/react'
import { rewardBenefits } from '@/content/rewards'
import { useMotionConfig, easePremium } from '@/lib/motion'

const icons = {
  zap: ListChecks,
  shield: ShieldCheck,
  globe: SlidersHorizontal,
}

export function RewardBenefits() {
  const { duration, reduce } = useMotionConfig()

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
        {rewardBenefits.map((item, index) => {
          const Icon = icons[item.icon]
          return (
            <motion.article
              key={item.title}
              className="rounded-2xl border border-line bg-surface px-6 py-7 shadow-card"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.07, ease: easePremium }}
            >
              <span className="grid size-11 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-display mt-5 text-lg font-semibold text-strong">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{item.copy}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
