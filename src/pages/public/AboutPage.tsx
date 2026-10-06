import { Building2, CheckCircle2, Globe, Heart, ShieldCheck, Target, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { Button } from '@/components/ui/button'
import { PageHero } from '@/components/shared/PageHero'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { aboutCta, aboutHero, aboutMission, aboutStats, aboutValues } from '@/content/about'
import { cardLiftClass, easePremium, useMotionConfig } from '@/lib/motion'
import { cn } from '@/lib/utils'

const statIcons = {
  users: Users,
  globe: Globe,
  badge: CheckCircle2,
  building: Building2,
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
            {aboutHero.titleLead} <span className="text-accent-deep">{aboutHero.titleAccent}</span>
          </>
        }
        description={aboutHero.description}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <AnimatedSection>
            <h2 className="font-display text-3xl text-ink sm:text-4xl">{aboutMission.title}</h2>
            {aboutMission.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="mt-4 text-sm leading-8 text-ink-soft sm:text-base">
                {paragraph}
              </p>
            ))}
            <ul className="mt-6 space-y-2">
              {aboutMission.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-soft">
                  <CheckCircle2 className="size-4 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedSection>
          <div className="grid grid-cols-2 gap-4">
            {aboutStats.map((item, index) => {
              const Icon = statIcons[item.icon]
              return (
                <motion.article
                  key={item.label}
                  className={cn(
                    'rounded-[1.5rem] border border-line bg-white p-5 text-center shadow-card',
                    cardLiftClass,
                    index === 2 && 'border-accent/25 shadow-soft',
                  )}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration, delay: reduce ? 0 : index * 0.06, ease: easePremium }}
                >
                  <span className={cn(
                    'mx-auto grid size-12 place-items-center rounded-2xl',
                    index === 2 ? 'bg-accent-soft text-accent-deep' : 'bg-brand-soft text-brand',
                  )}>
                    <Icon className="size-5" />
                  </span>
                  <p className="font-display mt-3 text-2xl text-ink">{item.value}</p>
                  <p className="mt-1 text-sm text-muted">{item.label}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            title="Our Values"
            description="These core values guide everything we do and shape how we interact with our community."
          />
        </AnimatedSection>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {aboutValues.map((item, index) => {
            const Icon = valueIcons[item.icon]
            return (
              <motion.article
                key={item.title}
                className={cn('group rounded-[1.6rem] border border-line bg-white p-6 text-center shadow-card', cardLiftClass)}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration, delay: reduce ? 0 : index * 0.07, ease: easePremium }}
              >
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 font-display text-xl text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{item.copy}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <AnimatedSection>
          <h2 className="font-display text-3xl text-ink sm:text-4xl">{aboutCta.title}</h2>
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
