import { ProcessJourney } from '@/components/how-it-works/ProcessJourney'
import { SurveyStatusGuide } from '@/components/how-it-works/SurveyStatusGuide'
import { WhyChooseSection } from '@/components/how-it-works/WhyChooseSection'
import { CtaSection } from '@/components/shared/CtaSection'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { PageHero } from '@/components/shared/PageHero'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { howItWorksCta, howItWorksFaqs, howItWorksHero } from '@/content/howItWorks'

export function HowItWorksPage() {
  return (
    <div>
      <PageHero
        eyebrow={howItWorksHero.eyebrow}
        title={
          <>
            {howItWorksHero.titleLead} <span className="text-accent-deep">{howItWorksHero.titleAccent}</span>
          </>
        }
        description={howItWorksHero.description}
      />
      <ProcessJourney />
      <SurveyStatusGuide />
      <WhyChooseSection />
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading
            title="Frequently Asked Questions"
            description="A few things people ask before they join."
          />
          <FaqAccordion items={howItWorksFaqs} className="mt-10" />
        </div>
      </section>
      <CtaSection
        title={howItWorksCta.title}
        description={howItWorksCta.description}
        primary={{ to: '/join', label: howItWorksCta.primary }}
        secondary={{ to: '/rewards', label: howItWorksCta.secondary }}
      />
    </div>
  )
}
