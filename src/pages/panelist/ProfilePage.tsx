import { useMemo, useRef, useState, type ReactNode } from 'react'
import { DateField } from '@/components/forms/DateField'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { OnboardingFields } from '@/components/forms/join/OnboardingFields'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input, ReadOnlyInput } from '@/components/ui/input'
import { composePhone, countryCodeForName, findCountry, parsePhone } from '@/content/countries'
import { PROFILE_SECTION_IDS, profileSectionCopy, type ProfileSectionId } from '@/content/profileQuestions'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { dateFieldError, formatIsoDate } from '@/lib/dateField'
import { invalidateIndustryEligibility } from '@/lib/industryEligibility'
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
import { isPostalQuestionLabel, sanitizePostalInput } from '@/lib/postalCode'
import { formatDate, initials, mediaUrl, omitKey } from '@/lib/utils'
import { NAME_ERROR, NAME_PATTERN, PHONE_MAX_DIGITS, rejectedNameMessage, sanitizeName, validatePhone } from '@/lib/validation'
import { authService } from '@/services/auth.service'
import { onboardingService } from '@/services/onboarding.service'
import { panelistService } from '@/services/panelist.service'
import { ApiRequestError } from '@/services/errors'

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const PHOTO_MAX_BYTES = 2 * 1024 * 1024
function focusFirstInvalid() {
  window.setTimeout(() => {
    const target = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!target) return
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 0)
}

function validateDateOfBirth(value: string) {
  return dateFieldError(value)
}

function validatePersonal(
  form: { name: string; phoneCountry: string; phone: string; country: string; dateOfBirth: string },
  countryRequired: boolean,
) {
  const errors: Record<string, string> = {}
  if (!form.name.trim()) errors.name = 'Full Name is required.'
  else if (!NAME_PATTERN.test(form.name.trim())) errors.name = NAME_ERROR
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
  const personalBaseline = useRef<{
    name: string
    phoneCountry: string
    phone: string
    country: string
    dateOfBirth: string
    countryAnswer: string | string[] | undefined
    postalKey: string
    postalAnswer: string | string[] | undefined
  } | null>(null)
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({})
  const [personalTouched, setPersonalTouched] = useState<Record<string, boolean>>({})
  const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({})
  const [sectionTouched, setSectionTouched] = useState<Record<string, boolean>>({})
  const [uploading, setUploading] = useState(false)
  const [editingPersonal, setEditingPersonal] = useState(false)
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

  function setResidenceCountry(label: string) {
    if (!countryQuestion || !form) return
    const option = countryQuestion.options.find((item) => item.label === label)
    if (!option) return
    const postal = profileQuestions.find((question) => isPostalQuestionLabel(question.label))
    const phoneCountry = countryCodeForName(label) ?? form.phoneCountry
    setForm((current) => {
      const answers = { ...current.answers, [countryQuestion.key]: option.value }
      const postalValue = postal ? answers[postal.key] : undefined
      if (postal && typeof postalValue === 'string') {
        const cleaned = sanitizePostalInput(label, postalValue)
        if (cleaned !== postalValue) answers[postal.key] = cleaned
      }
      return { ...current, country: label, phoneCountry, answers }
    })
    setPersonalTouched((current) => ({ ...current, country: true }))
    setPersonalErrors((current) => {
      const cleared = omitKey(current, 'country')
      if (phoneCountry === form.phoneCountry) return cleared
      const phoneError = validatePhone(phoneCountry, form.phone)
      return phoneError ? { ...cleared, phone: phoneError } : omitKey(cleared, 'phone')
    })
  }

  function beginPersonalEdit() {
    if (!form) return
    const postal = profileQuestions.find((question) => isPostalQuestionLabel(question.label))
    personalBaseline.current = {
      name: form.name,
      phoneCountry: form.phoneCountry,
      phone: form.phone,
      country: form.country,
      dateOfBirth: form.dateOfBirth,
      countryAnswer: countryQuestion ? form.answers[countryQuestion.key] : '',
      postalKey: postal?.key ?? '',
      postalAnswer: postal ? form.answers[postal.key] : '',
    }
    setSaveError('')
    setMessage('')
    setEditingPersonal(true)
  }

  function cancelPersonal() {
    const baseline = personalBaseline.current
    if (!baseline) {
      setEditingPersonal(false)
      return
    }
    setForm((current) => {
      const answers = { ...current.answers }
      if (countryQuestion) answers[countryQuestion.key] = baseline.countryAnswer ?? ''
      if (baseline.postalKey) answers[baseline.postalKey] = baseline.postalAnswer ?? ''
      return {
        ...current,
        name: baseline.name,
        phoneCountry: baseline.phoneCountry,
        phone: baseline.phone,
        country: baseline.country,
        dateOfBirth: baseline.dateOfBirth,
        answers,
      }
    })
    setPersonalErrors({})
    setPersonalTouched({})
    setSaveError('')
    setEditingPersonal(false)
  }

  function cancelSection(id: ProfileSectionId) {
    if (!seeded) return
    setForm((current) => {
      const answers = { ...current.answers }
      for (const question of sections[id]) {
        answers[question.key] = seeded.answers[question.key] ?? ''
        const otherKey = `${question.key}__other`
        answers[otherKey] = seeded.answers[otherKey] ?? ''
      }
      let country = current.country
      if (countryQuestion && sections[id].some((question) => question.key === countryQuestion.key)) {
        const value = answers[countryQuestion.key]
        country = typeof value === 'string' && value ? optionLabel(countryQuestion, value) : ''
      }
      return { ...current, answers, country }
    })
    setSectionErrors((current) => {
      const next = { ...current }
      for (const question of sections[id]) delete next[`q-${question.key}`]
      return next
    })
    setSectionTouched((current) => {
      const next = { ...current }
      for (const question of sections[id]) delete next[question.key]
      return next
    })
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
    const parent = key.replace(/__other$/, '')
    setSectionTouched((current) => ({ ...current, [parent]: true }))
    const next = validateQuestions(questions, form.answers)
    const errorKey = `q-${parent}`
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
      if (Object.keys(next).length) {
        focusFirstInvalid()
        return
      }
      const countryChanged = Boolean(countryQuestion) && form.country !== seeded.country
      const countryOption = countryQuestion?.options.find((item) => item.label === form.country)
      if (countryChanged && !countryOption) {
        setPersonalErrors((current) => ({ ...current, country: 'Select a country from the list.' }))
        focusFirstInvalid()
        return
      }
      const accountDirty =
        form.name.trim() !== seeded.name.trim() ||
        form.phone !== seeded.phone ||
        form.phoneCountry !== seeded.phoneCountry ||
        countryChanged
      if (!accountDirty) {
        if (form.dateOfBirth !== seeded.dateOfBirth) {
          setSaveError('Date of birth cannot be saved. Your account profile only accepts name and phone.')
        }
        return
      }
    }
    if (target !== 'personal') {
      const editable = sections[target]
      const nextErrors = validateQuestions(editable, form.answers)
      setSectionErrors((current) => ({ ...current, ...nextErrors }))
      setSectionTouched((current) => ({
        ...current,
        ...Object.fromEntries(editable.map((question) => [question.key, true])),
      }))
      if (Object.keys(nextErrors).length) {
        focusFirstInvalid()
        return
      }
    }
    saveInFlight.current = true
    setSaving(target)
    try {
      if (target === 'personal') {
        const countryChanged = Boolean(countryQuestion) && form.country !== seeded.country
        const countryOption = countryQuestion?.options.find((item) => item.label === form.country)
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
        const dobNote =
          form.dateOfBirth !== seeded.dateOfBirth
            ? ' Date of birth was not saved. Your account profile only accepts name and phone.'
            : ''
        setMessage(
          `Your name and mobile number were updated.${countryChanged ? ' Country was saved with your profile answers.' : ''}${dobNote}`,
        )
        setEditingPersonal(false)
      } else {
        const answers = answersForSave(data.answers, sections[target], form.answers)
        if (answers.length) await onboardingService.saveAnswers(answers)
        invalidateIndustryEligibility()
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

        <Section
          title="Personal Information"
          description="These details appear on your member account."
          action={
            editingPersonal ? null : (
              <Button type="button" variant="outline" size="sm" onClick={beginPersonalEdit}>
                Edit profile
              </Button>
            )
          }
        >
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
          <Field label="Full Name" htmlFor="profile-name" required error={editingPersonal ? personalErrors.name : undefined}>
            {editingPersonal ? (
              <Input
                id="profile-name"
                autoComplete="name"
                maxLength={100}
                value={form.name}
                onBlur={() => touchPersonal('name')}
                onChange={(event) => {
                  const raw = event.target.value
                  const name = sanitizeName(raw, 100)
                  const next = { ...form, name }
                  setForm(() => next)
                  const rejected = rejectedNameMessage(raw, 100)
                  if (rejected) {
                    setPersonalTouched((current) => ({ ...current, name: true }))
                    setPersonalErrors((current) => ({ ...current, name: rejected }))
                    return
                  }
                  syncPersonal(next, 'name')
                }}
              />
            ) : (
              <ReadOnlyInput id="profile-name" value={form.name} />
            )}
          </Field>
          <Field label="Email Address" htmlFor="profile-email" hint="Email is part of your sign-in and cannot be changed here.">
            <ReadOnlyInput id="profile-email" value={data.user.email} />
          </Field>
          <Field
            label="Country"
            htmlFor="profile-country"
            required={Boolean(countryQuestion?.required)}
            error={editingPersonal ? personalErrors.country : undefined}
          >
            {editingPersonal && countryQuestion ? (
              <SearchableSelect
                id="profile-country"
                options={countryQuestion.options.map((option) => option.label)}
                value={form.country}
                placeholder="Search country…"
                invalid={Boolean(personalErrors.country)}
                onBlur={() => touchPersonal('country')}
                onChange={setResidenceCountry}
              />
            ) : (
              <ReadOnlyInput id="profile-country" value={form.country} />
            )}
          </Field>
          <Field label="Mobile Number (Optional)" htmlFor="profile-phone" error={editingPersonal ? personalErrors.phone : undefined}>
            {editingPersonal ? (
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
            ) : (
              <ReadOnlyInput
                id="profile-phone"
                value={form.phone ? `+${findCountry(form.phoneCountry)?.dial ?? ''} ${form.phone}` : ''}
              />
            )}
          </Field>
          <Field
            label="Date of Birth"
            htmlFor="profile-dob"
            error={editingPersonal ? personalErrors.dateOfBirth : undefined}
            hint={editingPersonal ? 'Optional. This date is not stored on your account.' : undefined}
          >
            {editingPersonal ? (
              <DateField
                id="profile-dob"
                value={form.dateOfBirth}
                onBlur={() => touchPersonal('dateOfBirth')}
                onChange={(dateOfBirth) => {
                  const next = { ...form, dateOfBirth }
                  setForm(() => next)
                  syncPersonal(next, 'dateOfBirth')
                }}
              />
            ) : (
              <ReadOnlyInput id="profile-dob" value={formatIsoDate(form.dateOfBirth)} />
            )}
          </Field>
          {editingPersonal ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelPersonal} disabled={Boolean(saving)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void onSave('personal')} disabled={Boolean(saving) || !personalDirty}>
                {saving === 'personal' ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          ) : null}
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
                const parent = key.replace(/__other$/, '')
                const errorKey = `q-${parent}`
                if (!sectionTouched[parent] && !sectionErrors[errorKey]) return
                const nextValues = { ...form.answers, [key]: value }
                const next = validateQuestions(sections[id], nextValues)
                setSectionErrors((current) => (next[errorKey] ? { ...current, [errorKey]: next[errorKey] } : omitKey(current, errorKey)))
              }}
            />
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => cancelSection(id)}
                disabled={Boolean(saving) || !sectionDirty(sections[id], form.answers, seeded.answers)}
              >
                Cancel
              </Button>
              <Button
                type="button"
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

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-ink">{title}</h2>
            {description ? <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p> : null}
          </div>
          {action}
        </div>
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
  return questions.some((question) => {
    const keys = [question.key, `${question.key}__other`]
    return keys.some((key) => answerKey(current[key]) !== answerKey(original[key]))
  })
}
