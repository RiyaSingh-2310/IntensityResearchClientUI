import { useMemo, useRef, useState, type ReactNode } from 'react'
import { OnboardingFields } from '@/components/forms/join/OnboardingFields'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { countries, composePhone, parsePhone } from '@/content/countries'
import { PROFILE_SECTION_IDS, profileSectionCopy, type ProfileSectionId } from '@/content/profileQuestions'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { digitsOnly } from '@/lib/numeric'
import {
  answersForSave,
  answersToFormValues,
  buildProfileSections,
  optionLabel,
  validateQuestions,
  type AnswerValues,
  type FormQuestion,
} from '@/lib/profileQuestions'
import { formatDate, initials, mediaUrl, omitKey } from '@/lib/utils'
import { PHONE_MAX_DIGITS, validatePhone } from '@/lib/validation'
import { authService } from '@/services/auth.service'
import { onboardingService } from '@/services/onboarding.service'
import { panelistService } from '@/services/panelist.service'
import { ApiRequestError } from '@/services/errors'

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const PHOTO_MAX_BYTES = 2 * 1024 * 1024
const countryNames = countries.map((country) => country.name).sort((a, b) => a.localeCompare(b))

function todayIso() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function validateDateOfBirth(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return 'Please enter a valid date of birth.'
  const date = new Date(`${trimmed}T00:00:00`)
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 1900 || trimmed > todayIso()) {
    return 'Please enter a valid date of birth.'
  }
  return ''
}

function validatePersonal(
  form: { name: string; phoneCountry: string; phone: string; country: string; dateOfBirth: string },
  countryRequired: boolean,
) {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Full Name is required.'
  if (countryRequired && !form.country.trim()) errors.country = 'Country is required.'
  const phoneError = validatePhone(form.phoneCountry, form.phone)
  if (phoneError) errors.phone = phoneError
  const dobError = validateDateOfBirth(form.dateOfBirth)
  if (dobError) errors.dateOfBirth = dobError
  return errors
}

export function ProfilePage() {
  const { refresh } = useAuth()
  const { data, loading, error, reload } = useAsync(() => panelistService.getProfile())
  const [draft, setDraft] = useState<{
    name: string
    phoneCountry: string
    phone: string
    country: string
    dateOfBirth: string
    answers: AnswerValues
  } | null>(null)
  const [saving, setSaving] = useState<'personal' | ProfileSectionId | null>(null)
  const saveInFlight = useRef(false)
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({})
  const [personalTouched, setPersonalTouched] = useState<Record<string, boolean>>({})
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({})
  const [sectionTouched, setSectionTouched] = useState<Record<string, boolean>>({})
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const sections = useMemo(() => buildProfileSections(data?.steps ?? []), [data])
  const profileQuestions = useMemo(() => PROFILE_SECTION_IDS.flatMap((id) => sections[id]), [sections])
  const countryQuestion = useMemo(
    () => profileQuestions.find((question) => question.api.dropdown_category?.toLowerCase() === 'country'),
    [profileQuestions],
  )
  const seeded = useMemo(() => {
    if (!data) return null
    const phone = parsePhone(data.user.phone)
    const answers = answersToFormValues(data.answers, profileQuestions)
    const countryValue = countryQuestion ? answers[countryQuestion.key] : ''
    return {
      name: data.user.name,
      phoneCountry: phone.country,
      phone: digitsOnly(phone.number, PHONE_MAX_DIGITS),
      country: countryQuestion && typeof countryValue === 'string' ? optionLabel(countryQuestion, countryValue) : '',
      dateOfBirth: '',
      answers,
    }
  }, [countryQuestion, data, profileQuestions])
  const form = draft ?? seeded
  const visibleSectionIds = PROFILE_SECTION_IDS.filter((id) => sections[id].length)

  function setForm(updater: (current: NonNullable<typeof form>) => NonNullable<typeof form>) {
    if (!form) return
    setDraft(updater(form))
  }

  function syncPersonal(next: NonNullable<typeof form>, field: string) {
    if (!personalTouched[field]) return
    const messageForField = validatePersonal(next, Boolean(countryQuestion?.required))[field]
    setPersonalErrors((current) => (messageForField ? { ...current, [field]: messageForField } : omitKey(current, field)))
  }

  function touchPersonal(field: string, next = form) {
    setPersonalTouched((current) => ({ ...current, [field]: true }))
    if (!next) return
    const messageForField = validatePersonal(next, Boolean(countryQuestion?.required))[field]
    setPersonalErrors((current) => (messageForField ? { ...current, [field]: messageForField } : omitKey(current, field)))
  }

  function updateAnswer(key: string, value: string | string[]) {
    setForm((current) => {
      const answers = { ...current.answers, [key]: value }
      const country =
        countryQuestion && key === countryQuestion.key && typeof value === 'string'
          ? optionLabel(countryQuestion, value)
          : current.country
      return { ...current, answers, country }
    })
  }

  function onSectionBlur(questions: FormQuestion[], key: string) {
    if (!form) return
    setSectionTouched((current) => ({ ...current, [key]: true }))
    const nextValues = form.answers
    const next = validateQuestions(questions, nextValues)
    const errorKey = `q-${key}`
    setSectionErrors((current) => (next[errorKey] ? { ...current, [errorKey]: next[errorKey] } : omitKey(current, errorKey)))
  }

  async function onSave(target: 'personal' | ProfileSectionId) {
    if (!data || !form || !seeded || saveInFlight.current) return
    setSaveError('')
    setMessage('')
    if (target === 'personal') {
      const next = validatePersonal(form, Boolean(countryQuestion?.required))
      setPersonalErrors(next)
      setPersonalTouched({ name: true, country: true, phone: true, dateOfBirth: true })
      if (Object.keys(next).length) return
    }
    if (target !== 'personal') {
      const nextErrors = validateQuestions(sections[target], form.answers)
      setSectionErrors((current) => ({ ...current, ...nextErrors }))
      if (Object.keys(nextErrors).length) return
    }
    saveInFlight.current = true
    setSaving(target)
    try {
      if (target === 'personal') {
        const countryChanged = Boolean(countryQuestion) && form.country !== seeded.country
        const countryOption = countryQuestion?.options.find((item) => item.label === form.country)
        if (countryChanged && !countryOption) {
          setPersonalErrors((current) => ({ ...current, country: 'Select a country from the list.' }))
          return
        }
        const phoneChanged = form.phone !== seeded.phone || form.phoneCountry !== seeded.phoneCountry
        await authService.updateMe({
          name: form.name.trim(),
          phone: phoneChanged ? composePhone(form.phoneCountry, form.phone) : (data.user.phone ?? ''),
        })
        await refresh()
        if (countryChanged && countryQuestion && countryOption) {
          const answers = answersForSave(data.answers, [countryQuestion], { [countryQuestion.key]: countryOption.value })
          if (answers.length) await onboardingService.saveAnswers(answers)
        }
        const localNote = form.dateOfBirth.trim()
          ? ' Date of birth stays on this page for this visit. The account API does not store it.'
          : ''
        setMessage(`Your name and mobile number were updated.${countryChanged ? ' Country was saved with your profile answers.' : ''}${localNote}`)
      } else {
        const answers = answersForSave(data.answers, sections[target], form.answers)
        if (answers.length) await onboardingService.saveAnswers(answers)
        setMessage(`${profileSectionCopy[target].heading} was updated.`)
      }
      reload()
    } catch (err) {
      setSaveError(err instanceof ApiRequestError ? err.message : 'Unable to save your profile.')
    } finally {
      saveInFlight.current = false
      setSaving(null)
    }
  }

  async function onPhoto(input: HTMLInputElement) {
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    setSaveError('')
    setMessage('')
    if (!PHOTO_TYPES.includes(file.type)) {
      setSaveError('Only jpg, png, gif, webp images are allowed.')
      return
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setSaveError('Image must be under 2 MB.')
      return
    }
    setUploading(true)
    try {
      await authService.uploadPhoto(file)
      await refresh()
      setMessage('Photo updated.')
      reload()
    } catch (err) {
      setSaveError(err instanceof ApiRequestError ? err.message : 'Unable to upload that photo.')
    } finally {
      setUploading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <LoadingSkeleton rows={5} />
      </div>
    )
  }
  if (error && !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }
  if (!data || !form || !seeded) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <EmptyState title="Your account could not be loaded." />
      </div>
    )
  }

  const photo = mediaUrl(data.user.photo)
  const personalDirty =
    form.name.trim() !== seeded.name.trim() ||
    form.phone !== seeded.phone ||
    form.phoneCountry !== seeded.phoneCountry ||
    form.country !== seeded.country ||
    form.dateOfBirth !== seeded.dateOfBirth

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">Your account</p>
          <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">My Profile</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            View and update the details used to match you with research.
          </p>
          <p className="mt-3 text-sm text-muted">Member since {formatDate(data.user.created_at)}</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        {message ? (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success" role="status">
            {message}
          </p>
        ) : null}
        {saveError ? (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {saveError}
          </p>
        ) : null}

        <Section title="Personal Information" description="These details appear on your member account.">
          <div className="flex items-center gap-4">
            <div className="grid size-16 place-items-center overflow-hidden rounded-full bg-brand text-sm font-semibold text-white">
              {photo ? <img src={photo} alt="" className="size-full object-cover" /> : initials(data.user.name)}
            </div>
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={data.user.is_verified ? 'success' : 'warning'}>
                  {data.user.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge tone={data.user.onboarding_completed_at ? 'success' : 'warning'}>
                  {data.user.onboarding_completed_at ? 'Profile complete' : 'Profile incomplete'}
                </Badge>
              </div>
              <label className="mt-3 inline-flex cursor-pointer text-sm font-medium text-brand hover:underline">
                {uploading ? 'Uploading…' : 'Upload photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="sr-only"
                  disabled={uploading}
                  onChange={(event) => void onPhoto(event.currentTarget)}
                />
              </label>
            </div>
          </div>
          <Field label="Full Name" htmlFor="profile-name" required error={personalErrors.name}>
            <Input
              id="profile-name"
              autoComplete="name"
              maxLength={100}
              value={form.name}
              onBlur={() => touchPersonal('name')}
              onChange={(event) => {
                const name = event.target.value
                const next = { ...form, name }
                setForm(() => next)
                syncPersonal(next, 'name')
              }}
            />
          </Field>
          <Field label="Email Address" htmlFor="profile-email">
            <Input
              id="profile-email"
              value={data.user.email}
              disabled
              tabIndex={-1}
              aria-disabled="true"
              className="disabled:bg-neutral-100 disabled:text-muted disabled:opacity-100"
            />
          </Field>
          <Field label="Mobile Number (Optional)" htmlFor="profile-phone" error={personalErrors.phone}>
            <PhoneInput
              id="profile-phone"
              country={form.phoneCountry}
              number={form.phone}
              maxDigits={PHONE_MAX_DIGITS}
              onCountryChange={(value) => {
                const next = { ...form, phoneCountry: value }
                setForm(() => next)
                syncPersonal(next, 'phone')
              }}
              onBlur={() => touchPersonal('phone')}
              onNumberChange={(value) => {
                const next = { ...form, phone: value }
                setForm(() => next)
                syncPersonal(next, 'phone')
              }}
            />
          </Field>
          <Field label="Country" htmlFor="profile-country" required={Boolean(countryQuestion?.required)} error={personalErrors.country}>
            <SearchableSelect
              id="profile-country"
              options={countryQuestion ? countryQuestion.options.map((option) => option.label) : countryNames}
              value={form.country}
              invalid={Boolean(personalErrors.country)}
              placeholder="Search countries"
              onBlur={() => touchPersonal('country')}
              onChange={(country) => {
                const option = countryQuestion?.options.find((item) => item.label === country)
                const next = {
                  ...form,
                  country,
                  answers: option && countryQuestion ? { ...form.answers, [countryQuestion.key]: option.value } : form.answers,
                }
                setForm(() => next)
                if (personalTouched.country || personalErrors.country) syncPersonal(next, 'country')
              }}
            />
          </Field>
          <Field label="Date of Birth" htmlFor="profile-dob" error={personalErrors.dateOfBirth}>
            <Input
              id="profile-dob"
              type="date"
              max={todayIso()}
              min="1900-01-01"
              value={form.dateOfBirth}
              onBlur={() => touchPersonal('dateOfBirth')}
              onChange={(event) => {
                const dateOfBirth = event.target.value
                const next = { ...form, dateOfBirth }
                setForm(() => next)
                syncPersonal(next, 'dateOfBirth')
              }}
            />
          </Field>
          <div className="flex justify-end">
            <Button onClick={() => void onSave('personal')} disabled={Boolean(saving) || !personalDirty}>
              {saving === 'personal' ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Section>

        {visibleSectionIds.map((id) => (
          <Section key={id} title={profileSectionCopy[id].heading} description={profileSectionCopy[id].copy}>
            <OnboardingFields
              questions={sections[id]}
              values={form.answers}
              errors={sectionErrors}
              onBlur={(key) => onSectionBlur(sections[id], key)}
              onChange={(key, value) => {
                updateAnswer(key, value)
                if (!sectionTouched[key] && !sectionErrors[`q-${key}`]) return
                const nextValues = { ...form.answers, [key]: value }
                const next = validateQuestions(sections[id], nextValues)
                const errorKey = `q-${key}`
                setSectionErrors((current) => (next[errorKey] ? { ...current, [errorKey]: next[errorKey] } : omitKey(current, errorKey)))
              }}
            />
            <div className="flex justify-end">
              <Button
                onClick={() => void onSave(id)}
                disabled={Boolean(saving) || !sectionDirty(sections[id], form.answers, seeded.answers)}
              >
                {saving === id ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </Section>
        ))}
      </div>
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p> : null}
        <div className="mt-5 grid gap-4">{children}</div>
      </CardContent>
    </Card>
  )
}

function answerKey(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean).sort().join('|')
  return String(value ?? '').trim()
}

function sectionDirty(questions: FormQuestion[], current: AnswerValues, original: AnswerValues) {
  return questions.some((question) => answerKey(current[question.key]) !== answerKey(original[question.key]))
}
