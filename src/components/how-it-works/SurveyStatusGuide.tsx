import { motion } from 'motion/react'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ProjectStatusBadge } from '@/components/shared/StatusBadge'
import { surveyStatusGuide } from '@/content/howItWorks'
import { cardLiftClass, easePremium, useMotionConfig } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function SurveyStatusGuide() {
  const { duration, reduce } = useMotionConfig()

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <SectionHeading
            eyebrow={surveyStatusGuide.eyebrow}
            title={surveyStatusGuide.title}
            description={surveyStatusGuide.description}
          />
        </AnimatedSection>
        <dl className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {surveyStatusGuide.items.map((item, index) => (
            <motion.div
              key={item.status}
              className={cn('rounded-[1.6rem] border border-line bg-cream/70 p-6 shadow-card', cardLiftClass)}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.06, ease: easePremium }}
            >
              <dt>
                <ProjectStatusBadge status={item.status} />
              </dt>
              <dd className="mt-4 text-sm leading-6 text-ink-soft">{item.copy}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  )
}
