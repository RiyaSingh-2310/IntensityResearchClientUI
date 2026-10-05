import { Clock, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { whyChooseHowItWorks } from '@/content/howItWorks'
import { useMotionConfig, easePremium } from '@/lib/motion'

const icons = {
  clock: Clock,
  shield: ShieldCheck,
  sparkles: Sparkles,
}

export function WhyChooseSection() {
  const { duration, reduce } = useMotionConfig()

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-line bg-surface px-6 py-14 sm:px-10">
        <AnimatedSection>
          <SectionHeading title={whyChooseHowItWorks.title} description={whyChooseHowItWorks.description} />
        </AnimatedSection>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {whyChooseHowItWorks.items.map((item, index) => {
            const Icon = icons[item.icon]
            return (
              <motion.article
                key={item.title}
                className="rounded-2xl border border-line bg-cream px-6 py-8 text-center"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration, delay: reduce ? 0 : index * 0.07, ease: easePremium }}
              >
                <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-mid/30 bg-brand-soft text-accent">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-strong">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{item.copy}</p>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
