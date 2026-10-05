import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { ProjectStatusBadge } from '@/components/shared/StatusBadge'
import { surveyStatusGuide } from '@/content/howItWorks'

export function SurveyStatusGuide() {
  return (
    <section className="border-y border-line bg-cream/60 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <AnimatedSection>
          <SectionHeading
            eyebrow={surveyStatusGuide.eyebrow}
            title={surveyStatusGuide.title}
            description={surveyStatusGuide.description}
          />
        </AnimatedSection>
        <AnimatedSection>
          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {surveyStatusGuide.items.map((item) => (
              <div key={item.status} className="rounded-2xl border border-line bg-surface p-6">
                <dt>
                  <ProjectStatusBadge status={item.status} />
                </dt>
                <dd className="mt-4 text-sm leading-6 text-ink-soft">{item.copy}</dd>
              </div>
            ))}
          </dl>
        </AnimatedSection>
      </div>
    </section>
  )
}
