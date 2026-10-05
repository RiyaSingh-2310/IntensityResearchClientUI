import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Lock, ShieldCheck, Sparkles, Gift } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { JoinHero } from '@/components/forms/join/JoinHero'
import { JoinSidebar } from '@/components/forms/join/JoinSidebar'
import { OnboardingFields } from '@/components/forms/join/OnboardingFields'
import { RegistrationProgress } from '@/components/forms/join/RegistrationProgress'
import { RegistrationSuccess } from '@/components/forms/join/RegistrationSuccess'
import { ReviewStep } from '@/components/forms/join/ReviewStep'
import { PersonalStep, PrivacyStep } from '@/components/forms/join/JoinSteps'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { Button } from '@/components/ui/button'
import { joinIncentive, joinTrust } from '@/config/brand'
import { PROFILE_SECTION_IDS, type ProfileSectionId } from '@/content/profileQuestions'
import { useAuth } from '@/hooks/useAuth'
import { useAsync } from '@/hooks/useAsync'
import { savePendingOnboarding } from '@/lib/pendingOnboarding'
import {
  buildConsentAnswers,
  buildProfileAnswers,
  buildProfileSections,
  type AnswerValue,
} from '@/lib/profileQuestions'
import { scrollToRegistrationStep } from '@/lib/scrollToStep'
import { useMotionConfig } from '@/lib/motion'
import {
  emptyRegisterForm,
  registerSteps,
  firstInvalidStep,
  validateRegisterForm,
  validateRegisterStep,
  type RegisterStepId,
} from '@/lib/validation'
import { DUPLICATE_EMAIL_MESSAGE } from '@/services/auth.service'
import { ApiRequestError } from '@/services/errors'
import { onboardingService } from '@/services/onboarding.service'
import type { RegisterPayload } from '@/types/auth'

const trustIcons = [Lock, ShieldCheck, Sparkles, Gift]
function isProfileStep(id: RegisterStepId): id is ProfileSectionId {
  return (PROFILE_SECTION_IDS as RegisterStepId[]).includes(id)
}

export function JoinPage() {
  const { user, register } = useAuth()
  const { duration } = useMotionConfig()
  const questionsState = useAsync(() => onboardingService.getQuestions())
  const [stepId, setStepId] = useState<RegisterStepId>('account')
  const [form, setForm] = useState<RegisterPayload>(emptyRegisterForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [emailAvailabilityError, setEmailAvailabilityError] = useState('')
  const [success, setSuccess] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [invalidAttempt, setInvalidAttempt] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const stepSectionRef = useRef<HTMLDivElement>(null)
  const skipInitialScroll = useRef(true)
  const submitInFlight = useRef(false)
  const apiSteps = questionsState.data?.steps
  const sections = useMemo(() => buildProfileSections(apiSteps ?? []), [apiSteps])
  const flowSteps = registerSteps
  const foundIndex = flowSteps.findIndex((item) => item.id === stepId)
  const stepIndex = foundIndex === -1 ? 0 : foundIndex
  const current = flowSteps[stepIndex] ?? flowSteps[0]
  const isLast = stepIndex === flowSteps.length - 1
  const liveErrors = isLast ? validateRegisterForm(form, sections, flowSteps) : validateRegisterStep(form, current.id, sections)
  const baseErrors = Object.keys(errors).length ? liveErrors : {}
  const shownErrors =
    emailAvailabilityError && !baseErrors.email
      ? { ...baseErrors, email: emailAvailabilityError }
      : baseErrors

  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false
      return
    }
    const timer = window.setTimeout(() => {
      scrollToRegistrationStep(stepSectionRef.current)
    }, 80)
    return () => window.clearTimeout(timer)
  }, [stepId])

  useEffect(() => {
    if (!invalidAttempt) return
    const target = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!target) return
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [invalidAttempt])

  function update<K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }))
    if (key === 'email') setEmailAvailabilityError('')
  }

  function updateAnswer(key: string, value: AnswerValue) {
    setForm((currentForm) => ({
      ...currentForm,
      answers: { ...currentForm.answers, [key]: value },
    }))
  }

  function goToStep(index: number) {
    const target = flowSteps[index]
    if (!target) return
    setErrors({})
    setStepId(target.id)
  }

  function goNext() {
    if (submitting) return
    const nextErrors = validateRegisterStep(form, current.id, sections)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setInvalidAttempt((count) => count + 1)
      return
    }

    setFormError('')
    setEmailAvailabilityError('')
    goToStep(Math.min(stepIndex + 1, flowSteps.length - 1))
  }

  function buildPendingAnswers() {
    const profileQuestions = flowSteps.flatMap((item) => (isProfileStep(item.id) ? sections[item.id] : []))
    const results = [
      buildProfileAnswers(profileQuestions, form.answers),
      buildConsentAnswers(apiSteps ?? [], {
        emailInvitations: form.emailInvitations,
        acceptTerms: form.acceptTerms,
        acceptPrivacy: form.acceptPrivacy,
      }),
    ]
    const unmapped = results.flatMap((result) => result.unmapped)
    if (unmapped.length && import.meta.env.DEV) {
      console.warn('[registration] The API has no question to store these answers yet:', unmapped)
    }
    return results.flatMap((result) => result.answers)
  }

  async function submitForm() {
    if (submitInFlight.current) return
    const nextErrors = validateRegisterForm(form, sections, flowSteps)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      const invalidIndex = firstInvalidStep(form, sections, flowSteps)
      if (invalidIndex === stepIndex) setInvalidAttempt((count) => count + 1)
      else setStepId(flowSteps[invalidIndex]?.id ?? 'account')
      return
    }
    submitInFlight.current = true
    setSubmitting(true)
    setFormError('')
    try {
      const outcome = await register(form)
      savePendingOnboarding(form.email, buildPendingAnswers())
      setEmailSent(outcome.emailSent)
      setEmailError(outcome.emailError ?? '')
      setSuccess(true)
    } catch (error) {
      const requestError = error instanceof ApiRequestError ? error : null
      if (requestError?.status === 409) {
        // The API reports duplicates on submit; send the user back to fix the email.
        setEmailAvailabilityError(DUPLICATE_EMAIL_MESSAGE)
        setFormError('')
        setStepId('account')
      } else {
        setFormError(requestError?.message ?? 'Something went wrong while creating your profile. Please try again.')
        if (requestError?.fieldErrors) {
          setErrors((currentErrors) => ({ ...currentErrors, ...requestError.fieldErrors }))
        }
      }
    } finally {
      submitInFlight.current = false
      setSubmitting(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (isLast) void submitForm()
    else goNext()
  }

  const reassurance = useMemo(
    () =>
      joinTrust.map((item, index) => {
        const Icon = trustIcons[index] ?? Lock
        return (
          <span key={item} className="inline-flex items-center gap-1.5">
            <Icon className="size-3.5 text-accent" />
            {item}
          </span>
        )
      }),
    [],
  )

  if (user && !success) return <Navigate to="/dashboard" replace />
  if (success) {
    return (
      <RegistrationSuccess email={form.email} emailSent={emailSent} emailError={emailError} />
    )
  }

  const hasQuestions = Boolean(apiSteps?.length)

  return (
    <div className="bg-paper pb-16">
      <JoinHero />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:items-start lg:px-8">
        <JoinSidebar />
        <div className="min-w-0">
          {questionsState.loading ? <LoadingSkeleton rows={4} /> : null}
          {questionsState.error ? (
            <ErrorState message={questionsState.error} onRetry={questionsState.reload} />
          ) : null}
          {!questionsState.loading && !questionsState.error && !hasQuestions ? (
            <EmptyState title="Registration questions are unavailable right now." description="Please try again shortly." />
          ) : null}
          {!questionsState.loading && !questionsState.error && hasQuestions ? (
            <form ref={formRef} className="overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8" onSubmit={onSubmit} noValidate>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Create your Intensity Research account</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">
                It takes a few minutes. Your answers help us invite you to studies that match your profile.
              </p>
              <div>
                <div className="mt-6">
                  <RegistrationProgress steps={flowSteps} step={stepIndex} onSelect={(index) => index <= stepIndex && goToStep(index)} />
                </div>
                <div ref={stepSectionRef} className="mt-8 scroll-mt-24 border-t border-line pt-6">
                  <p className="text-sm text-muted">{current.copy}</p>
                  <h3 className="font-display mt-1 text-2xl text-ink">{current.heading}</h3>
                </div>
                {formError ? (
                  <div className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
                    <p>{formError}</p>
                    <button type="button" className="mt-2 font-medium underline" onClick={() => (isLast ? void submitForm() : goNext())}>
                      Try again
                    </button>
                  </div>
                ) : null}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration }}
                  >
                    {current.id === 'review' ? (
                      <ReviewStep form={form} sections={sections} />
                    ) : current.id === 'account' ? (
                      <PersonalStep form={form} errors={shownErrors} update={update} />
                    ) : current.id === 'privacy' ? (
                      <PrivacyStep form={form} errors={shownErrors} update={update} />
                    ) : (
                      <OnboardingFields
                        questions={sections[current.id]}
                        values={form.answers}
                        errors={shownErrors}
                        onChange={updateAnswer}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  disabled={stepIndex === 0 || submitting}
                  onClick={() => goToStep(stepIndex - 1)}
                >
                  Back
                </Button>
                {isLast ? (
                  <Button type="submit" disabled={submitting} className="sm:min-w-64">
                    {submitting ? 'Creating your profile…' : 'Complete Registration'}
                  </Button>
                ) : (
                  <Button type="button" disabled={submitting} onClick={goNext}>
                    Continue
                  </Button>
                )}
              </div>
              {isLast ? (
                <p className="mt-4 text-center text-xs leading-5 text-muted">{joinIncentive.disclaimer}</p>
              ) : null}
              <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted">{reassurance}</div>
            </form>
          ) : null}
          <p className="mt-6 text-center text-sm text-muted">
            Already a member?{' '}
            <Link to="/login" className="font-medium text-accent hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
