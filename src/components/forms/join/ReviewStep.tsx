import type { ReactNode } from 'react'
import { findCountry } from '@/content/countries'
import { PROFILE_SECTION_IDS, profileSectionCopy } from '@/content/profileQuestions'
import { answerDisplay, type ProfileSections } from '@/lib/profileQuestions'
import type { RegisterPayload } from '@/types/auth'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/80 py-3 last:border-b-0 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted sm:max-w-[55%]">{label}</dt>
      <dd className="text-sm font-medium break-words text-ink sm:text-right">{value || '—'}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-cream/40 px-4 py-2">
      <h4 className="pt-3 text-sm font-semibold tracking-wide text-ink">{title}</h4>
      <dl>{children}</dl>
    </section>
  )
}

const yesNo = (value: boolean) => (value ? 'Yes' : 'No')
const agreed = (value: boolean) => (value ? 'Agreed' : 'Not agreed')

export function ReviewStep({
  form,
  sections,
}: {
  form: RegisterPayload
  sections: ProfileSections
}) {
  const dial = findCountry(form.phoneCountry)?.dial
  const phone = form.phone ? `${dial ? `+${dial} ` : ''}${form.phone}` : ''

  return (
    <div className="mt-6 space-y-4">
      <p className="text-sm leading-6 text-ink-soft">
        Review your details before submitting. Use Back to edit any section. Your password is never shown here.
      </p>
      <Section title="Account Information">
        <Row label="First name" value={form.firstName} />
        <Row label="Last name" value={form.lastName} />
        <Row label="Email" value={form.email} />
        <Row label="Mobile number" value={phone} />
      </Section>
      {PROFILE_SECTION_IDS.map((id) =>
        sections[id].length ? (
          <Section key={id} title={profileSectionCopy[id].heading}>
            {sections[id].map((question) => (
              <Row key={question.key} label={question.label} value={answerDisplay(question, form.answers[question.key])} />
            ))}
          </Section>
        ) : null,
      )}
      <Section title="Privacy & consent">
        <Row label="Terms & Conditions and Privacy Policy" value={agreed(form.acceptTerms)} />
        <Row label="Data sharing for research" value={agreed(form.acceptPrivacy)} />
        <Row label="Marketing emails" value={yesNo(form.emailInvitations)} />
      </Section>
    </div>
  )
}
