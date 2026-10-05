import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OnboardingFields } from '@/components/forms/join/OnboardingFields'
import { PasswordField } from '@/components/forms/PasswordField'
import { PasswordStrength } from '@/components/shared/PasswordStrength'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { paths } from '@/config/paths'
import { composePhone, parsePhone } from '@/content/countries'
import { PROFILE_SECTION_IDS, profileSectionCopy, type ProfileSectionId } from '@/content/profileQuestions'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { digitsOnly } from '@/lib/numeric'
import {
  answersToFormValues,
  buildProfileAnswers,
  buildProfileSections,
  type AnswerValues,
  type FormQuestion,
} from '@/lib/profileQuestions'
import { formatDate, initials, mediaUrl } from '@/lib/utils'
import { PHONE_MAX_DIGITS, validateNewPassword, validatePhone } from '@/lib/validation'
import { authService } from '@/services/auth.service'
import { onboardingService } from '@/services/onboarding.service'
import { panelistService } from '@/services/panelist.service'
import { ApiRequestError } from '@/services/errors'

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const PHOTO_MAX_BYTES = 2 * 1024 * 1024

export function SettingsPage() {
  const { refresh, logout } = useAuth()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const { data, loading, error, reload } = useAsync(() => panelistService.getProfile())
  const loaded = Boolean(data)

  useEffect(() => {
    if (!loaded || !hash) return
    const target = document.getElementById(hash.slice(1))
    if (!target) return
    const timer = window.setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
    return () => window.clearTimeout(timer)
  }, [loaded, hash])
  const [draft, setDraft] = useState<{
    name: string
    phoneCountry: string
    phone: string
    answers: AnswerValues
  } | null>(null)
  const [saving, setSaving] = useState<'personal' | ProfileSectionId | null>(null)
  const saveInFlight = useRef(false)
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const sections = useMemo(() => buildProfileSections(data?.steps ?? []), [data])
  const seeded = useMemo(() => {
    if (!data) return null
    const phone = parsePhone(data.user.phone)
    return {
      name: data.user.name,
      phoneCountry: phone.country,
      phone: digitsOnly(phone.number, PHONE_MAX_DIGITS),
      answers: answersToFormValues(
        data.answers,
        PROFILE_SECTION_IDS.flatMap((id) => sections[id]),
      ),
    }
  }, [data, sections])
  const form = draft ?? seeded
  const visibleSectionIds = PROFILE_SECTION_IDS.filter((id) => sections[id].length)

  function setForm(updater: (current: NonNullable<typeof form>) => NonNullable<typeof form>) {
    if (!form) return
    setDraft(updater(form))
  }

  function updateAnswer(key: string, value: string | string[]) {
    setForm((current) => ({
      ...current,
      answers: { ...current.answers, [key]: value },
    }))
  }

  async function onSave(target: 'personal' | ProfileSectionId) {
    if (!data || !form || !seeded || saveInFlight.current) return
    setSaveError('')
    setMessage('')
    if (target === 'personal') {
      const next: Record<string, string> = {}
      if (!form.name.trim()) next.name = 'Enter your full name.'
      const phoneError = validatePhone(form.phoneCountry, form.phone)
      if (phoneError) next.phone = phoneError
      setPersonalErrors(next)
      if (Object.keys(next).length) return
    }
    saveInFlight.current = true
    setSaving(target)
    try {
      if (target === 'personal') {
        const phoneChanged = form.phone !== seeded.phone || form.phoneCountry !== seeded.phoneCountry
        await authService.updateMe({
          name: form.name.trim(),
          phone: phoneChanged ? composePhone(form.phoneCountry, form.phone) : (data.user.phone ?? ''),
        })
        await refresh()
        setMessage('Your account details were updated.')
      } else {
        const answers = buildProfileAnswers(sections[target], form.answers).answers
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

  async function onLogout() {
    setLoggingOut(true)
    try {
      navigate(paths.home)
      await logout()
    } finally {
      setLoggingOut(false)
      setConfirmLogout(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <LoadingSkeleton rows={5} />
      </div>
    )
  }
  if (error && !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ErrorState message={error} onRetry={reload} />
      </div>
    )
  }
  if (!data || !form || !seeded) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <EmptyState title="Your account could not be loaded." />
      </div>
    )
  }

  const photo = mediaUrl(data.user.photo)
  const personalDirty =
    form.name.trim() !== seeded.name.trim() || form.phone !== seeded.phone || form.phoneCountry !== seeded.phoneCountry

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent uppercase">Your account</p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-ink sm:text-5xl">Profile & settings</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            Update your personal details, keep your research profile current, and manage how you sign in.
          </p>
          <p className="mt-3 text-sm text-muted">Member since {formatDate(data.user.created_at)}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
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
          title="Personal information"
          description="These details appear on your member account. Email stays tied to the address you registered with."
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
              <label className="mt-3 inline-flex cursor-pointer text-sm font-medium text-accent hover:underline">
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
          <Field label="Full name" htmlFor="settings-name" required error={personalErrors.name}>
            <Input
              id="settings-name"
              autoComplete="name"
              maxLength={100}
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
          </Field>
          <Field label="Email" htmlFor="settings-email" hint="Email cannot be changed here.">
            <Input id="settings-email" value={data.user.email} readOnly />
          </Field>
          <Field label="Mobile number" htmlFor="settings-phone" hint="Optional" error={personalErrors.phone}>
            <PhoneInput
              id="settings-phone"
              country={form.phoneCountry}
              number={form.phone}
              maxDigits={PHONE_MAX_DIGITS}
              onCountryChange={(value) => setForm((current) => ({ ...current, phoneCountry: value }))}
              onNumberChange={(value) => setForm((current) => ({ ...current, phone: value }))}
            />
          </Field>
          <div className="flex justify-end">
            <Button onClick={() => void onSave('personal')} disabled={Boolean(saving) || !personalDirty}>
              {saving === 'personal' ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Section>

        <ChangePasswordForm />

        {visibleSectionIds.map((id) => (
          <Section key={id} title={profileSectionCopy[id].heading} description="Used to match relevant studies to your profile.">
            <OnboardingFields
              questions={sections[id]}
              values={form.answers}
              errors={{}}
              onChange={updateAnswer}
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

        <Section title="Log out" description="Sign out of this browser. You can always sign back in from the public site.">
          <Button variant="outline" onClick={() => setConfirmLogout(true)}>
            Log out
          </Button>
        </Section>
      </div>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent title="Log out of Intensity Research?" description="You’ll return to the public website. Your points and profile stay saved.">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>
              Stay signed in
            </Button>
            <Button variant="danger" onClick={() => void onLogout()} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Log out'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id?: string
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardContent className="pt-6">
        <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
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

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    const next = validateNewPassword(password, confirmPassword)
    if (!password) next.password = 'Enter a new password.'
    if (!currentPassword) next.currentPassword = 'Enter your current password.'
    else if (!next.password && password === currentPassword) {
      next.password = 'Choose a password different from your current one.'
    }
    setErrors(next)
    setFormError('')
    setSuccess('')
    if (Object.keys(next).length) return
    inFlight.current = true
    setSubmitting(true)
    try {
      const result = await authService.changePassword({ currentPassword, newPassword: password })
      setCurrentPassword('')
      setPassword('')
      setConfirmPassword('')
      setSuccess(result.message?.trim() || 'Your password was updated.')
    } catch (err) {
      const requestError = err instanceof ApiRequestError ? err : null
      const fields = { ...requestError?.fieldErrors }
      if (!fields.current_password && !fields.new_password && /current password/i.test(requestError?.message ?? '')) {
        fields.current_password = requestError?.message ?? ''
      }
      setErrors({
        ...(fields.current_password ? { currentPassword: fields.current_password } : {}),
        ...(fields.new_password ? { password: fields.new_password } : {}),
      })
      if (!fields.current_password && !fields.new_password) {
        setFormError(requestError?.message ?? 'Unable to update your password. Please try again.')
      }
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return (
    <Section
      id="change-password"
      title="Change password"
      description="Enter your current password, then choose a new one with at least 8 characters, including a letter and a number. Forgot your current password? Log out and use “Forgot password” on the login page."
    >
      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        {formError ? (
          <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {formError}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-xl bg-success-soft px-4 py-3 text-sm text-success" role="status">
            {success}
          </p>
        ) : null}
        <Field label="Current password" htmlFor="current-password" required error={errors.currentPassword}>
          <PasswordField
            id="current-password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </Field>
        <Field label="New password" htmlFor="new-password" required error={errors.password}>
          <PasswordField
            id="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        <PasswordStrength password={password} />
        <Field label="Confirm new password" htmlFor="confirm-new-password" required error={errors.confirmPassword}>
          <PasswordField
            id="confirm-new-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Updating…' : 'Change Password'}
          </Button>
        </div>
      </form>
    </Section>
  )
}
