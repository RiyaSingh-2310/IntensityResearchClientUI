import { Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { paths } from '@/config/paths'
import { useMotionConfig } from '@/lib/motion'
import { ApiRequestError } from '@/services/errors'
import { authService } from '@/services/auth.service'

export function RegistrationSuccess({
  email,
  emailSent = false,
  emailError,
}: {
  email?: string
  emailSent?: boolean
  emailError?: string
}) {
  const { duration } = useMotionConfig()
  const [delivered, setDelivered] = useState(emailSent)
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resendMessage, setResendMessage] = useState('')

  async function resend() {
    if (!email || resendState === 'sending') return
    setResendState('sending')
    setResendMessage('')
    try {
      const result = await authService.resendActivation(email)
      if (!result.emailSent) {
        throw new ApiRequestError({ message: 'Could not send activation email. Please try again later.' }, 502)
      }
      setResendState('sent')
      setDelivered(true)
      setResendMessage(`We’ve sent a new verification email to ${email}. Please check your inbox and click Verify Email.`)
    } catch (error) {
      setResendState('error')
      setDelivered(false)
      setResendMessage(
        error instanceof ApiRequestError ? error.message : 'We could not send the email. Please try again.',
      )
    }
  }

  const heading = delivered
    ? resendState === 'sent'
      ? 'Verification Email Sent'
      : 'Check Your Email'
    : 'We couldn’t send your verification email'

  return (
    <div className="px-4 py-16 sm:px-6">
      <motion.div
        className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-8 text-center shadow-card sm:p-10"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration }}
      >
        <motion.div
          className={`mx-auto grid size-14 place-items-center rounded-full ${delivered ? 'bg-brand-soft text-accent' : 'bg-danger-soft text-danger'}`}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration, delay: 0.08 }}
        >
          <Mail className="size-7" />
        </motion.div>
        <p className="mt-5 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
          {delivered ? 'Almost there' : 'Account created'}
        </p>
        <h1 className="font-display mt-3 text-4xl text-ink">{heading}</h1>
        <p className="mt-4 text-ink-soft">
          {delivered ? (
            <>We’ve sent a verification email{email ? ` to ${email}` : ''}. Open the message and click Activate Account to verify your account.</>
          ) : (
            <>
              We created your account{email ? ` for ${email}` : ''}, but we couldn’t send the activation email right now.
              Please try sending the activation email again.
            </>
          )}
        </p>
        {!delivered && emailError ? (
          <p className="mt-3 text-sm text-danger" role="status">
            {emailError}
          </p>
        ) : null}
        {delivered ? (
          <p className="mt-3 text-sm text-ink-soft">Your account stays inactive until you verify. Then you can log in.</p>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">
            You will not be able to log in until the verification email is sent and you complete verification.
          </p>
        )}
        {resendMessage ? (
          <p className={`mt-4 text-sm ${resendState === 'error' ? 'text-danger' : 'text-accent'}`} role="status">
            {resendMessage}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {email ? (
            <Button type="button" variant="outline" disabled={resendState === 'sending'} onClick={() => void resend()}>
              {resendState === 'sending' ? 'Sending…' : 'Resend Verification Email'}
            </Button>
          ) : null}
          <Button asChild>
            <Link to={paths.login}>Go to login</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          <Link to={paths.home} className="font-medium text-accent hover:underline">
            Back to Home
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
