import { CheckCircle2, Globe, Heart, LayoutDashboard, Mail, ShieldCheck, Target } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/shared/PageHero'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { aboutCta, aboutHero, aboutMission, aboutPillars, aboutValues } from '@/content/about'
import { easePremium, useMotionConfig } from '@/lib/motion'

const pillarIcons = {
  target: Target,
  badge: CheckCircle2,
  layout: LayoutDashboard,
  mail: Mail,
}

const valueIcons = {
  shield: ShieldCheck,
  heart: Heart,
  target: Target,
  globe: Globe,
}

export function AboutPage() {
  const { duration, reduce } = useMotionConfig()

  return (
    <div>
      <PageHero
        eyebrow={aboutHero.eyebrow}
        title={
          <>
            {aboutHero.titleLead} <span className="text-accent">{aboutHero.titleAccent}</span>
          </>
        }
        description={aboutHero.description}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimatedSection>
            <h2 className="font-display text-3xl font-semibold text-strong sm:text-4xl">{aboutMission.title}</h2>
            {aboutMission.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-4 text-sm leading-8 text-ink-soft sm:text-base">
                {paragraph}
              </p>
            ))}
            <ul className="mt-6 space-y-2">
              {aboutMission.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                  <CheckCircle2 className="size-4 text-signal" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <div className="grid grid-cols-2 gap-4">
            {aboutPillars.map((item, index) => {
              const Icon = pillarIcons[item.icon]
              return (
                <motion.article
                  key={item.title}
                  className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand-mid/50"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration, delay: reduce ? 0 : index * 0.06, ease: easePremium }}
                >
                  <span className="grid size-11 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-display mt-4 text-lg font-semibold text-strong">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{item.copy}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream/60 px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            title="Our values"
            description="The principles behind how we run the panel."
          />
        </AnimatedSection>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {aboutValues.map((item, index) => {
            const Icon = valueIcons[item.icon]
            return (
              <motion.article
                key={item.title}
                className="group rounded-2xl border border-line bg-surface p-6 text-center transition-colors hover:border-brand-mid/50"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration, delay: reduce ? 0 : index * 0.07, ease: easePremium }}
              >
                <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-brand-mid/30 bg-brand-soft text-accent transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-strong">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{item.copy}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="font-display text-3xl font-semibold text-strong sm:text-4xl">{aboutCta.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft sm:text-base">{aboutCta.description}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contact">{aboutCta.primary}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/join">{aboutCta.secondary}</Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>
    </div>
  )
}
