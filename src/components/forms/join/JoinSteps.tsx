import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PasswordField } from '@/components/forms/PasswordField'
import { PhoneInput } from '@/components/forms/PhoneInput'
import { PasswordStrength } from '@/components/shared/PasswordStrength'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { paths } from '@/config/paths'
import { NAME_MAX_LENGTH, PHONE_MAX_DIGITS } from '@/lib/validation'
import type { RegisterPayload } from '@/types/auth'

interface StepProps {
  form: RegisterPayload
  errors: Record<string, string>
  update: <K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) => void
}

export function PersonalStep({ form, errors, update }: StepProps) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      <Field label="First name" htmlFor="firstName" required error={errors.firstName}>
        <Input
          id="firstName"
          placeholder="First name"
          autoComplete="given-name"
          aria-required="true"
          maxLength={NAME_MAX_LENGTH}
          value={form.firstName}
          onChange={(event) => update('firstName', event.target.value)}
        />
      </Field>
      <Field label="Last name" htmlFor="lastName" required error={errors.lastName}>
        <Input
          id="lastName"
          placeholder="Last name"
          autoComplete="family-name"
          aria-required="true"
          maxLength={NAME_MAX_LENGTH}
          value={form.lastName}
          onChange={(event) => update('lastName', event.target.value)}
        />
      </Field>
      <Field label="Email address" htmlFor="email" required error={errors.email} className="sm:col-span-2">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-required="true"
          placeholder="you@email.com"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
        />
      </Field>
      <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="Optional" className="sm:col-span-2">
        <PhoneInput
          id="phone"
          country={form.phoneCountry}
          number={form.phone}
          maxDigits={PHONE_MAX_DIGITS}
          onCountryChange={(value) => update('phoneCountry', value)}
          onNumberChange={(value) => update('phone', value)}
        />
      </Field>
      <Field label="Password" htmlFor="password" required error={errors.password} hint="At least 8 characters, with a letter and a number." className="sm:col-span-2">
        <PasswordField id="password" autoComplete="new-password" aria-required="true" value={form.password} onChange={(event) => update('password', event.target.value)} />
      </Field>
      <div className="sm:col-span-2">
        <PasswordStrength password={form.password} />
      </div>
      <Field label="Confirm password" htmlFor="confirmPassword" required error={errors.confirmPassword} className="sm:col-span-2">
        <PasswordField id="confirmPassword" autoComplete="new-password" aria-required="true" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} />
      </Field>
    </div>
  )
}

function ConsentCheckbox({
  id,
  checked,
  onChange,
  required,
  error,
  children,
}: {
  id: string
  checked: boolean
  onChange: (value: boolean) => void
  required?: boolean
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        aria-required={required || undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-0.5 aria-invalid:border-danger"
      />
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer text-sm leading-6 text-ink-soft">
        {children}
      </label>
    </div>
  )
}

function ConsentGroup({
  legend,
  required,
  error,
  errorId,
  className,
  children,
}: {
  legend: string
  required?: boolean
  error?: string
  errorId?: string
  className?: string
  children: ReactNode
}) {
  return (
    <fieldset className={className}>
      <legend className="float-left mb-2 flex w-full items-center gap-1 text-sm font-medium text-ink-soft">
        {legend}
        {required ? (
          <>
            <span className="text-danger" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </legend>
      <div className="clear-left space-y-2">
        {children}
        {error ? (
          <p id={errorId} className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </fieldset>
  )
}

const consentCardClass = 'rounded-2xl border border-line p-4'

function PolicyLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline-offset-2 hover:underline">
      {children}
    </Link>
  )
}

export function PrivacyStep({ form, errors, update }: StepProps) {
  return (
    <div className="mt-6 grid gap-5">
      <ConsentGroup legend="Terms & Conditions" required error={errors.acceptTerms} errorId="acceptTerms-error" className={consentCardClass}>
        <ConsentCheckbox
          id="acceptTerms"
          required
          error={errors.acceptTerms}
          checked={form.acceptTerms}
          onChange={(value) => update('acceptTerms', value)}
        >
          I accept the Intensity Research <PolicyLink to={paths.termsConditions}>Terms &amp; Conditions</PolicyLink> and{' '}
          <PolicyLink to={paths.privacyPolicy}>Privacy Policy</PolicyLink>.
        </ConsentCheckbox>
      </ConsentGroup>

      <ConsentGroup legend="Data sharing for research" required error={errors.acceptPrivacy} errorId="acceptPrivacy-error" className={consentCardClass}>
        <ConsentCheckbox
          id="acceptPrivacy"
          required
          error={errors.acceptPrivacy}
          checked={form.acceptPrivacy}
          onChange={(value) => update('acceptPrivacy', value)}
        >
          I consent to Intensity Research using and sharing my profile information for panel membership and research
          purposes, as described in the <PolicyLink to={paths.privacyPolicy}>Privacy Policy</PolicyLink>.
        </ConsentCheckbox>
      </ConsentGroup>

      <ConsentGroup legend="Marketing emails" className={consentCardClass}>
        <ConsentCheckbox id="emailInvitations" checked={form.emailInvitations} onChange={(value) => update('emailInvitations', value)}>
          Yes, send me marketing emails with panel news and updates. You can change this later in your profile.
        </ConsentCheckbox>
      </ConsentGroup>
    </div>
  )
}
