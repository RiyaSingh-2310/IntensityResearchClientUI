import { ClipboardList, Gift, Search, UserPlus } from 'lucide-react'
import { motion } from 'motion/react'
import { howItWorksSteps } from '@/content/howItWorks'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { useMotionConfig, easePremium } from '@/lib/motion'
import { cn } from '@/lib/utils'

const icons = {
  userPlus: UserPlus,
  clipboard: ClipboardList,
  search: Search,
  gift: Gift,
}

export function ProcessJourney() {
  const { duration, reduce } = useMotionConfig()

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <AnimatedSection>
        <SectionHeading
          eyebrow="The process"
          title="Four steps to get started"
          description="A clear path from creating your account to redeeming your points."
        />
      </AnimatedSection>

      <div className="relative mx-auto mt-14 max-w-6xl">
        <div className="pointer-events-none absolute top-7 right-[12%] left-[12%] hidden h-px bg-line lg:block" aria-hidden="true">
          <motion.span
            className="absolute inset-y-0 left-0 origin-left bg-gradient-to-r from-brand to-signal"
            style={{ height: 2, top: -0.5, width: '100%' }}
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduce ? 0 : 0.9, ease: easePremium }}
          />
        </div>

        <ol className="grid gap-6 lg:grid-cols-4">
          {howItWorksSteps.map((step, index) => {
            const Icon = icons[step.icon]
            return (
              <motion.li
                key={step.title}
                className="relative"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration, delay: reduce ? 0 : index * 0.08, ease: easePremium }}
              >
                <div className="mb-5 hidden justify-center lg:flex">
                  <span className="relative z-10 grid size-14 place-items-center rounded-full border-4 border-paper bg-brand font-display text-sm font-semibold text-white shadow-glow">
                    {step.n}
                  </span>
                </div>
                <article
                  className={cn(
                    'flex h-full flex-col rounded-2xl border border-line bg-surface p-6',
                    'transition-[transform,border-color] duration-200 hover:border-brand-mid/50 motion-safe:hover:-translate-y-1',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl border border-brand-mid/30 bg-brand-soft text-accent">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="grid size-9 place-items-center rounded-full bg-brand font-display text-xs font-semibold text-white lg:hidden">
                      {step.n}
                    </span>
                  </div>
                  <h3 className="font-display mt-5 text-xl font-semibold text-strong">{step.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{step.copy}</p>
                  <ul className="mt-5 space-y-2 rounded-xl border border-line bg-cream px-4 py-3">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-ink-soft">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
