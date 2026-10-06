import { Globe, ShieldCheck, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { rewardBenefits } from '@/content/rewards'
import { useMotionConfig, easePremium } from '@/lib/motion'

const icons = {
  zap: Zap,
  shield: ShieldCheck,
  globe: Globe,
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
              className="rounded-[1.6rem] border border-line bg-white px-6 py-8 shadow-card transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lift"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.07, ease: easePremium }}
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{item.copy}</p>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
