import { Send } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EMAIL_PATTERN, NAME_MAX_LENGTH, NAME_PATTERN } from '@/lib/validation'
import { ApiRequestError } from '@/services/errors'
import { contactService } from '@/services/contact.service'

export function ContactForm({
  layout = 'full',
  idPrefix = 'contact',
}: {
  layout?: 'full' | 'simple'
  idPrefix?: string
}) {
  const [name, setName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [sentTo, setSentTo] = useState('')
  const [formError, setFormError] = useState('')
  const inFlight = useRef(false)

  function splitName(full: string) {
    const parts = full.trim().split(/\s+/).filter(Boolean)
    return {
      firstName: parts[0] ?? '',
      lastName: parts.slice(1).join(' '),
    }
  }

  function applyApiErrors(fieldErrors: Record<string, string> | undefined) {
    if (!fieldErrors) return
    const next: Record<string, string> = {}
    for (const [key, value] of Object.entries(fieldErrors)) {
      const target =
        key === 'first_name'
          ? layout === 'full'
            ? 'firstName'
            : 'name'
          : key === 'last_name'
            ? layout === 'full'
              ? 'lastName'
              : 'name'
            : key === 'message'
              ? 'message'
              : key
      if (!next[target]) next[target] = value
    }
    if (Object.keys(next).length) setErrors((current) => ({ ...current, ...next }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current) return
    const next: Record<string, string> = {}
    const names = layout === 'full' ? { firstName: firstName.trim(), lastName: lastName.trim() } : splitName(name)
    if (layout === 'full') {
      if (!names.firstName) next.firstName = 'Please enter your first name.'
      else if (names.firstName.length > NAME_MAX_LENGTH) next.firstName = 'First name must be 30 characters or fewer.'
      else if (!NAME_PATTERN.test(names.firstName)) next.firstName = 'Enter a valid first name.'
      if (!names.lastName) next.lastName = 'Please enter your last name.'
      else if (names.lastName.length > NAME_MAX_LENGTH) next.lastName = 'Last name must be 30 characters or fewer.'
      else if (!NAME_PATTERN.test(names.lastName)) next.lastName = 'Enter a valid last name.'
    } else if (!name.trim()) {
      next.name = 'Please enter your name.'
    } else if (!names.lastName) {
      next.name = 'Please enter your first and last name.'
    }
    if (!email.trim() || !EMAIL_PATTERN.test(email)) next.email = 'Enter a valid email address.'
    if (!subject.trim()) next.subject = 'Please add a subject.'
    if (!message.trim()) next.message = 'Tell us how we can help.'
    setErrors(next)
    if (Object.keys(next).length) return

    inFlight.current = true
    setSubmitting(true)
    setFormError('')
    const replyTo = email.trim()
    try {
      await contactService.submit({
        firstName: names.firstName,
        lastName: names.lastName,
        email: replyTo,
        subject: subject.trim(),
        message: message.trim(),
      })
      setFirstName('')
      setLastName('')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setErrors({})
      setSentTo(replyTo)
      setSuccess(true)
    } catch (error) {
      const requestError = error instanceof ApiRequestError ? error : null
      applyApiErrors(requestError?.fieldErrors)
      setFormError(requestError?.message || 'Unable to send your message. Please try again.')
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-success-soft px-5 py-8 text-center" role="status">
        <h3 className="font-display text-2xl text-ink">Message received</h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Thank you. We will reply to {sentTo} as soon as we can, typically within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form className="grid gap-5" onSubmit={onSubmit} noValidate>
      {formError ? (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}
      {layout === 'full' ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor={`${idPrefix}-first`} required error={errors.firstName}>
            <Input
              id={`${idPrefix}-first`}
              autoComplete="given-name"
              maxLength={NAME_MAX_LENGTH}
              placeholder="Enter your first name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>
          <Field label="Last name" htmlFor={`${idPrefix}-last`} required error={errors.lastName}>
            <Input
              id={`${idPrefix}-last`}
              autoComplete="family-name"
              maxLength={NAME_MAX_LENGTH}
              placeholder="Enter your last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor={`${idPrefix}-name`} required error={errors.name}>
            <Input
              id={`${idPrefix}-name`}
              autoComplete="name"
              placeholder="Your full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor={`${idPrefix}-email`} required error={errors.email}>
            <Input
              id={`${idPrefix}-email`}
              type="email"
              autoComplete="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        </div>
      )}
      {layout === 'full' ? (
        <Field label="Email address" htmlFor={`${idPrefix}-email`} required error={errors.email}>
          <Input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
      ) : null}
      <Field label="Subject" htmlFor={`${idPrefix}-subject`} required error={errors.subject}>
        <Input
          id={`${idPrefix}-subject`}
          autoComplete="off"
          placeholder="What’s this about?"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
      </Field>
      <Field label="Message" htmlFor={`${idPrefix}-message`} required error={errors.message}>
        <Textarea
          id={`${idPrefix}-message`}
          placeholder={
            layout === 'full'
              ? 'Tell us more about your question or concern...'
              : 'Please describe your question or issue in detail...'
          }
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Field>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? (
          'Sending…'
        ) : (
          <>
            <Send />
            Send message
          </>
        )}
      </Button>
    </form>
  )
}
