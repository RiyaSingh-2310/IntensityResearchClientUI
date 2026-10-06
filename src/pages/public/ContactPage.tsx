import { motion } from 'motion/react'
import { ContactMethodCard } from '@/components/contact/ContactMethodCard'
import { ContactSidebar } from '@/components/contact/ContactSidebar'
import { ContactForm } from '@/components/forms/ContactForm'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { PageHero } from '@/components/shared/PageHero'
import { SectionHeading } from '@/components/shared/SectionHeading'
import { contactFaqs, contactHero, contactMethods } from '@/content/contact'
import { easePremium, useMotionConfig } from '@/lib/motion'

export function ContactPage() {
  const { duration, reduce } = useMotionConfig()

  return (
    <div>
      <PageHero
        eyebrow={contactHero.eyebrow}
        title={
          <>
            {contactHero.titleLead}
            <br />
            <span className="text-accent-deep">{contactHero.titleAccent}</span>
          </>
        }
        description={contactHero.description}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            title="Choose How to Reach Us"
            description="Multiple ways to get the help you need, when you need it."
          />
        </AnimatedSection>
        <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.id}
              className="h-full min-w-0"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.06, ease: easePremium }}
            >
              <ContactMethodCard
                title={method.title}
                copy={method.copy}
                detail={method.detail}
                cta={method.cta}
                href={method.href}
                icon={method.icon}
                hoverAccent={method.id === 'email'}
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <AnimatedSection>
            <div id="contact-message" className="scroll-mt-24 rounded-[1.7rem] border border-line bg-cream/40 p-6 shadow-card sm:p-8">
              <h2 className="font-display text-3xl text-ink">Send Us a Message</h2>
              <p className="mt-2 text-sm text-ink-soft">Fill out the form below and we’ll get back to you by email.</p>
              <div className="mt-8">
                <ContactForm layout="full" idPrefix="contact-page" />
              </div>
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.08}>
            <ContactSidebar />
          </AnimatedSection>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionHeading
            title="Frequently Asked Questions"
            description={
              <>
                Quick answers to common questions. Can’t find what you’re looking for?{' '}
                <a href="#contact-message" className="font-medium text-brand hover:underline">
                  Contact us directly!
                </a>
              </>
            }
          />
        </AnimatedSection>
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2">
          {contactFaqs.map((item, index) => (
            <motion.article
              key={item.q}
              className="rounded-[1.5rem] border border-line bg-white p-6 shadow-card"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.05, ease: easePremium }}
            >
              <h3 className="font-display text-xl text-ink">{item.q}</h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft">{item.a}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
