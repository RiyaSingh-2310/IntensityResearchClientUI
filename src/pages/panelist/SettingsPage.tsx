import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PasswordField } from '@/components/forms/PasswordField'
import { PasswordStrength } from '@/components/shared/PasswordStrength'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Field } from '@/components/ui/field'
import { paths } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'
import { omitKey } from '@/lib/utils'
import { validateNewPassword } from '@/lib/validation'
import { authService } from '@/services/auth.service'
import { ApiRequestError } from '@/services/errors'

export function SettingsPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

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

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">Your account</p>
          <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">Settings</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            Change your password or sign out of this browser.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <ChangePasswordForm />
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

function Section({ id, title, description, children }: { id?: string; title: string; description?: string; children: ReactNode }) {
  return (
    <Card id={id} className="scroll-mt-24">
      <CardContent className="pt-6">
        <h2 className="font-display text-2xl text-ink">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-ink-soft">{description}</p> : null}
        <div className="mt-5 grid gap-4">{children}</div>
      </CardContent>
    </Card>
  )
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

  function liveErrors(current: string, nextPassword: string, confirm: string) {
    const next = validateNewPassword(nextPassword, confirm)
    if (!nextPassword) next.password = 'Enter a new password.'
    if (!current) next.currentPassword = 'Enter your current password.'
    else if (!next.password && nextPassword === current) next.password = 'Choose a password different from your current one.'
    return next
  }

  function updateField(key: 'currentPassword' | 'password' | 'confirmPassword', current: string, nextPassword: string, confirm: string) {
    if (!errors[key]) return
    const next = liveErrors(current, nextPassword, confirm)
    setErrors((existing) => (next[key] ? { ...existing, [key]: next[key] } : omitKey(existing, key)))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    const next = liveErrors(currentPassword, password, confirmPassword)
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
      title="Change Password"
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
            onChange={(event) => {
              const value = event.target.value
              setCurrentPassword(value)
              updateField('currentPassword', value, password, confirmPassword)
            }}
          />
        </Field>
        <Field label="New password" htmlFor="new-password" required error={errors.password}>
          <PasswordField
            id="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => {
              const value = event.target.value
              setPassword(value)
              updateField('password', currentPassword, value, confirmPassword)
            }}
          />
        </Field>
        <PasswordStrength password={password} />
        <Field label="Confirm new password" htmlFor="confirm-new-password" required error={errors.confirmPassword}>
          <PasswordField
            id="confirm-new-password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => {
              const value = event.target.value
              setConfirmPassword(value)
              updateField('confirmPassword', currentPassword, password, value)
            }}
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
