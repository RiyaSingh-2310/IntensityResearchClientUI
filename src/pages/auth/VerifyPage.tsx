import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, LoaderCircle, MailX } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { brand } from '@/config/brand'
import { paths } from '@/config/paths'
import { readActivationToken } from '@/lib/activationToken'
import { EMAIL_PATTERN } from '@/lib/validation'
import { ApiRequestError } from '@/services/errors'
import { authService } from '@/services/auth.service'

type VerifyStatus = 'loading' | 'success' | 'already' | 'invalid' | 'expired' | 'missing' | 'error'

function classifyVerifyError(error: unknown): Exclude<VerifyStatus, 'loading' | 'success' | 'missing'> {
  if (!(error instanceof ApiRequestError)) return 'error'
  const message = error.message.toLowerCase()
  if (
    error.status === 409 ||
    message.includes('already verified') ||
    message.includes('already activated') ||
    message.includes('already active')
  ) {
    return 'already'
  }
  if (error.status === 410 || message.includes('expired')) return 'expired'
  if (error.status === 404 || error.status === 400 || error.status === 422 || message.includes('invalid')) {
    return 'invalid'
  }
  return 'error'
}

export function VerifyPage() {
  const [params] = useSearchParams()
  const { token: pathToken } = useParams()
  const token = useMemo(
    () => readActivationToken(params, typeof window !== 'undefined' ? window.location.hash : '', pathToken),
    [params, pathToken],
  )
  const [status, setStatus] = useState<VerifyStatus>(token ? 'loading' : 'missing')
  const [detail, setDetail] = useState('')
  const [retry, setRetry] = useState(0)
  const [email, setEmail] = useState('')
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  useEffect(() => {
    if (!token) return

    let cancelled = false
    authService
      .verify(token)
      .then(() => {
        if (!cancelled) setStatus('success')
      })
      .catch((error) => {
        if (cancelled) return
        setStatus(classifyVerifyError(error))
        setDetail(error instanceof ApiRequestError ? error.message : '')
      })

    return () => {
      cancelled = true
    }
  }, [token, retry])

  async function resend() {
    if (resendState === 'sending') return
    if (!EMAIL_PATTERN.test(email.trim())) {
      setResendState('error')
      setResendMessage('Enter a valid email address.')
      return
    }
    setResendState('sending')
    setResendMessage('')
    try {
      const result = await authService.resendActivation(email.trim())
      if (!result.emailSent) {
        throw new ApiRequestError({ message: 'Could not send activation email. Please try again later.' }, 502)
      }
      setResendState('sent')
      setResendMessage('We’ve sent a new verification email. Please check your inbox and click Verify Email.')
    } catch (error) {
      setResendState('error')
      setResendMessage(error instanceof ApiRequestError ? error.message : 'We could not resend the email. Please try again.')
    }
  }

  const copy =
    status === 'loading'
      ? {
          title: 'Verifying your email…',
          body: `Please wait while we activate your ${brand.name} account.`,
        }
      : status === 'success'
        ? {
            title: 'Email verified',
            body: `Your email has been verified. You can now log in to your ${brand.name} account.`,
          }
        : status === 'already'
          ? {
              title: 'Email already verified',
              body: 'This account is already activated. You can log in with your email and password.',
            }
          : status === 'expired'
            ? {
                title: 'Verification Link Expired',
                body: detail || 'This verification link has expired. Enter your email below to request a new activation link.',
              }
            : status === 'error'
              ? {
                  title: 'We couldn’t verify your email',
                  body:
                    detail || 'The connection failed or the server is unavailable. Please try again in a moment.',
                }
              : status === 'missing'
                ? {
                    title: 'Verification link invalid',
                    body: 'This page needs a valid verification link from your email.',
                  }
                : {
                    title: 'Verification link invalid',
                    body: detail || 'This verification link is invalid or no longer available.',
                  }

  const showLogin = status !== 'loading'
  const loginLabel = status === 'success' || status === 'already' ? 'Go to login' : 'Back to login'
  const showResend = status === 'expired' || status === 'invalid' || status === 'missing'

  return (
    <div className="hero-grid px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-lg rounded-3xl border border-line bg-surface p-8 text-center shadow-lift sm:p-10">
        <div className="mb-8 flex justify-center">
          <Logo size="md" />
        </div>
        <div
          className={`mx-auto grid size-14 place-items-center rounded-full ${
            status === 'success' || status === 'already'
              ? 'bg-success-soft text-success'
              : status === 'loading'
                ? 'bg-brand-soft text-accent'
                : 'bg-danger-soft text-danger'
          }`}
        >
          {status === 'loading' ? (
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          ) : status === 'success' || status === 'already' ? (
            <CheckCircle2 className="size-7" aria-hidden="true" />
          ) : (
            <MailX className="size-7" aria-hidden="true" />
          )}
        </div>
        <h1 className="font-display mt-5 text-3xl font-semibold text-strong">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{copy.body}</p>
        {status === 'error' ? (
          <Button
            className="mt-8"
            type="button"
            variant="outline"
            onClick={() => {
              setStatus('loading')
              setDetail('')
              setRetry((value) => value + 1)
            }}
          >
            Try again
          </Button>
        ) : null}
        {showResend ? (
          <form
            className="mt-6 text-left"
            onSubmit={(event) => {
              event.preventDefault()
              void resend()
            }}
          >
            <Field label="Email address" htmlFor="resend-activation-email" required>
              <Input
                id="resend-activation-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            {resendMessage ? (
              <p className={`mt-2 text-sm ${resendState === 'error' ? 'text-danger' : 'text-accent'}`} role="status">
                {resendMessage}
              </p>
            ) : null}
            <Button className="mt-4 w-full" type="submit" disabled={resendState === 'sending'}>
              {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
            </Button>
          </form>
        ) : null}
        {showLogin ? (
          <Button className={status === 'error' || showResend ? 'mt-3' : 'mt-8'} asChild>
            <Link to={paths.login}>{loginLabel}</Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
