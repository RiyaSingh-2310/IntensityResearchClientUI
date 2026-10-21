import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { AdditionalProfileFields } from '@/components/forms/AdditionalProfileFields'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { paths } from '@/config/paths'
import {
  additionalProfileCompleteLabel,
  additionalProfileKinds,
  additionalProfileIntro,
  additionalProfileLabels,
  additionalProfileSummaries,
  defaultAdditionalProfileKind,
  type AdditionalProfileKind,
} from '@/content/questionnaires'
import { useAsync } from '@/hooks/useAsync'
import {
  applyProfileAnswer,
  buildAnswerPayload,
  displayProfileAnswer,
  reconcileProfileAnswers,
  isQuestionVisible,
  panelsFor,
  questionsForPanel,
  toggleMultiOption,
  validateProfileQuestions,
  type AdditionalAnswerMap,
  type ProfileQuestion,
} from '@/lib/additionalProfileForm'

const noQuestions: ProfileQuestion[] = []
import { sessionProfileRecord, useAdditionalProfileSync, useSessionProfiles } from '@/lib/additionalProfileSession'
import { useIndustryEligibility } from '@/lib/industryEligibility'
import { availableProfileKinds } from '@/lib/industryPanels'
import { omitKey } from '@/lib/utils'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageState'
import { ApiRequestError } from '@/services/errors'
import { additionalProfileService } from '@/services/additionalProfile.service'

function focusFirstInvalid() {
  window.setTimeout(() => {
    const target = document.querySelector<HTMLElement>('[aria-invalid="true"]')
    if (!target) return
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 0)
}

function isKind(value: string | null): value is AdditionalProfileKind {
  return additionalProfileKinds.includes(value as AdditionalProfileKind)
}

export function AdditionalProfilePage() {
  const [params, setParams] = useSearchParams()
  const sync = useAdditionalProfileSync()
  const hydrated = sync !== 'pending'
  const { answers, order } = useSessionProfiles()
  const [loadError, setLoadError] = useState('')
  const requested = params.get('type')
  const view = params.get('view')
  const viewing = isKind(view) && answers[view] ? view : null
  const editing = isKind(requested) ? requested : null
  const industry = useIndustryEligibility()
  const stored = viewing ? answers[viewing] : undefined
  const introKind = editing ?? viewing
  const intro = introKind ? additionalProfileIntro[introKind] : null
  const creating = Boolean(editing && !answers[editing])
  const industryPending = industry.status === 'idle' || industry.status === 'loading'
  const creationAllowed =
    !creating || (industry.status === 'ready' && industry.eligible.includes(editing as AdditionalProfileKind))

  useEffect(() => {
    let cancelled = false
    additionalProfileService.getState().then(
      () => {
        if (!cancelled) setLoadError('')
      },
      (error) => {
        if (!cancelled) {
          setLoadError(error instanceof ApiRequestError ? error.message : 'Your additional profiles could not be loaded.')
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <section className="hero-grid px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">Your account</p>
          <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">
            {intro ? intro.title : editing ? 'Add Profile' : 'Additional Profile'}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-ink-soft">
            {intro
              ? intro.description
              : 'Review the additional profiles on this account. Add another type whenever you are ready.'}
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        {!hydrated ? <LoadingSkeleton rows={3} /> : null}
        {hydrated && loadError && !editing ? (
          <ErrorState message={loadError} onRetry={() => window.location.reload()} />
        ) : null}
        {hydrated && editing ? (
          creating && (industryPending || industry.status === 'error') ? (
            industry.status === 'error' ? (
              <ErrorState message="Your industry could not be loaded, so a new profile cannot be started." onRetry={() => window.location.reload()} />
            ) : (
              <LoadingSkeleton rows={3} />
            )
          ) : !creationAllowed ? (
            <Card>
              <CardContent className="grid gap-4 pt-6">
                <h2 className="font-display text-2xl text-ink">This profile is not available</h2>
                <p className="text-sm leading-6 text-ink-soft">
                  {industry.status === 'ready' && industry.label
                    ? `${additionalProfileLabels[editing]} is not offered for your industry. Existing profiles stay saved.`
                    : 'Save the industry your organization operates in before adding a profile. Profile options stay hidden until that answer is saved.'}
                </p>
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setParams({})}>Back</Button>
                  {industry.status === 'ready' && !industry.label ? (
                    <Button asChild>
                      <Link to={paths.profile}>Go to profile</Link>
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : (
            <PanelWizard
              key={editing}
              kind={editing}
              initial={answers[editing]}
              onCancel={() => setParams({})}
              onSaved={() => setParams({})}
            />
          )
        ) : hydrated && stored && viewing ? (
          <ProfileOverview kind={viewing} answers={stored} onEdit={() => setParams({ type: viewing })} />
        ) : hydrated && !loadError ? (
          <Overview
            answers={answers}
            order={order}
            industry={industry}
            onOpen={(kind) => setParams({ view: kind })}
            onBegin={(kind) => setParams({ type: kind })}
          />
        ) : null}
      </div>
    </div>
  )
}

function Overview({
  answers,
  order,
  industry,
  onOpen,
  onBegin,
}: {
  answers: Partial<Record<AdditionalProfileKind, AdditionalAnswerMap>>
  order: AdditionalProfileKind[]
  industry: ReturnType<typeof useIndustryEligibility>
  onOpen: (kind: AdditionalProfileKind) => void
  onBegin: (kind: AdditionalProfileKind) => void
}) {
  const created = order.filter((kind) => answers[kind])
  const industryReady = industry.status === 'ready'
  const available = industryReady ? availableProfileKinds(industry.label, created) : []
  const preferred = defaultAdditionalProfileKind(available)
  const [picked, setPicked] = useState<AdditionalProfileKind | null>(preferred)
  const selected = picked && available.includes(picked) ? picked : preferred
  const showIndustryGate = industry.status === 'error' || (industryReady && !industry.label)

  return (
    <div className="grid gap-4">
      {created.map((kind) => {
        const kept = industryReady && industry.label && !industry.eligible.includes(kind)
        return (
          <Card key={kind}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Users className="mt-1 size-4 shrink-0 text-brand" />
                <div className="min-w-0">
                  <h2 className="font-display text-2xl text-ink">{additionalProfileIntro[kind].title}</h2>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{additionalProfileSummaries[kind]}</p>
                  {kept ? (
                    <p className="mt-2 text-sm leading-6 text-muted">
                      This profile was saved earlier. Changing industry does not delete it or its answers.
                    </p>
                  ) : null}
                </div>
              </div>
              <Button type="button" variant="outline" onClick={() => onOpen(kind)}>
                View questions
              </Button>
            </CardContent>
          </Card>
        )
      })}
      {showIndustryGate ? (
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <h2 className="font-display text-2xl text-ink">Industry needed</h2>
            <p className="text-sm leading-6 text-ink-soft">
              {industry.status === 'error'
                ? 'Your industry could not be loaded, so new profile options are hidden. Existing profiles stay available.'
                : 'Panel options stay hidden until the industry your organization operates in is saved on your profile.'}
            </p>
            {industry.status === 'ready' ? (
              <div className="flex justify-end">
                <Button asChild>
                  <Link to={paths.profile}>Go to profile</Link>
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
      {industry.status === 'loading' || industry.status === 'idle' ? <LoadingSkeleton rows={2} /> : null}
      {available.length > 0 && selected ? (
        <Card>
          <CardContent className="grid gap-4 pt-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
              <Users className="size-5" />
              Add Profile
            </h2>
            <p className="text-sm leading-6 text-ink-soft">
              {created.length === 0
                ? 'Choose a profile type and answer its questions one step at a time. Each profile stays separate from the others.'
                : 'Choose another profile type. Profiles you have already completed stay in the list above.'}
            </p>
            <ProfileTypeOptions available={available} selected={selected} onSelect={setPicked} />
            <div className="flex justify-end">
              <Button type="button" onClick={() => onBegin(selected)}>Continue</Button>
            </div>
          </CardContent>
        </Card>
      ) : created.length === 0 ? (
        <EmptyState title="No additional profiles yet." description="Choose a profile type when questions are available." />
      ) : null}
    </div>
  )
}

function ProfileTypeOptions({
  available,
  selected,
  onSelect,
}: {
  available: AdditionalProfileKind[]
  selected: AdditionalProfileKind
  onSelect: (kind: AdditionalProfileKind) => void
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="sr-only">Profile type</legend>
      {available.map((kind) => {
        const checked = selected === kind
        return (
          <label
            key={kind}
            className={`grid cursor-pointer grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-xl border px-3 py-3 ${checked ? 'border-brand bg-brand-soft/50' : 'border-line bg-white'}`}
          >
            <input
              type="radio"
              name="profile-type"
              className="mt-0.5 size-4 accent-brand"
              checked={checked}
              onChange={() => onSelect(kind)}
            />
            <span className="text-sm font-medium text-ink">{additionalProfileLabels[kind]}</span>
            <span className="col-start-2 text-sm leading-5 text-ink-soft">{additionalProfileSummaries[kind]}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

function ProfileOverview({
  kind,
  answers,
  onEdit,
}: {
  kind: AdditionalProfileKind
  answers: AdditionalAnswerMap
  onEdit: () => void
}) {
  const questionsState = useAsync(() => additionalProfileService.getQuestions(kind), kind)
  const panels = questionsState.data ? panelsFor(kind, questionsState.data.questions) : []

  return (
    <div className="grid gap-4">
      {questionsState.loading ? <LoadingSkeleton rows={3} /> : null}
      {questionsState.error ? <ErrorState message={questionsState.error} onRetry={questionsState.reload} /> : null}
      {questionsState.data ? (
        <>
          <div className="flex justify-end">
            <Button type="button" onClick={onEdit}>Edit</Button>
          </div>
          {panels.map((panel) => (
            <Card key={panel.id}>
              <CardContent className="pt-6">
                <h2 className="font-display text-2xl text-ink">{panel.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{panel.description}</p>
                <dl className="mt-4">
                  {questionsForPanel(questionsState.data?.questions ?? [], panel.keys).map((question) => {
                    if (!isQuestionVisible(question, answers)) return null
                    return (
                      <div key={question.key} className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-2">
                        <dt className="text-sm text-muted">{question.label}</dt>
                        <dd className="text-sm font-medium break-words text-ink">{displayProfileAnswer(question, answers) || '—'}</dd>
                      </div>
                    )
                  })}
                </dl>
              </CardContent>
            </Card>
          ))}
        </>
      ) : null}
      <Button asChild variant="outline" className="w-fit">
        <Link to={paths.additionalProfile}>Back to Additional Profile</Link>
      </Button>
    </div>
  )
}

function PanelWizard({
  kind,
  initial,
  onCancel,
  onSaved,
}: {
  kind: AdditionalProfileKind
  initial?: AdditionalAnswerMap
  onCancel: () => void
  onSaved: () => void
}) {
  const questionsState = useAsync(() => additionalProfileService.getQuestions(kind), kind)
  const questions = questionsState.data?.questions ?? noQuestions
  const panels = useMemo(() => panelsFor(kind, questions), [kind, questions])
  const savedAnswers = useMemo(
    () => reconcileProfileAnswers(questions, initial ? { ...initial } : {}),
    [questions, initial],
  )
  const savedSignature = JSON.stringify(savedAnswers)
  const [edited, setEdited] = useState(false)
  const [appliedSignature, setAppliedSignature] = useState(savedSignature)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<AdditionalAnswerMap>(savedAnswers)
  if (!edited && appliedSignature !== savedSignature) {
    setAppliedSignature(savedSignature)
    setAnswers(savedAnswers)
  }
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const saveInFlight = useRef(false)
  const dirty = edited
  const panel = panels[step]
  const panelQuestions = useMemo(() => (panel ? questionsForPanel(questions, panel.keys) : []), [panel, questions])
  const lastStep = panels.length > 0 && step === panels.length - 1

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  useEffect(() => {
    function onLeave(event: BeforeUnloadEvent) {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  function onChange(key: string, value: string | string[]) {
    setEdited(true)
    const nextAnswers = applyProfileAnswer(questions, answers, key, value)
    setAnswers(nextAnswers)
    const parentKey = key.replace(/__other$/, '')
    const next = validateProfileQuestions(panelQuestions, nextAnswers)
    const errorKey = `q-${parentKey}`
    setErrors((current) => {
      if (!touched[key] && !touched[parentKey] && !current[errorKey]) return current
      if (next[errorKey]) return { ...current, [errorKey]: next[errorKey] }
      return omitKey(current, errorKey)
    })
  }

  function onToggle(question: ProfileQuestion, optionKey: string) {
    setEdited(true)
    const nextAnswers = toggleMultiOption(questions, answers, question, optionKey)
    setAnswers(nextAnswers)
    const next = validateProfileQuestions(panelQuestions, nextAnswers)
    const errorKey = `q-${question.key}`
    setErrors((current) => {
      if (!touched[question.key] && !current[errorKey]) return current
      if (next[errorKey]) return { ...current, [errorKey]: next[errorKey] }
      return omitKey(current, errorKey)
    })
  }

  function onBlur(key: string) {
    setTouched((current) => ({ ...current, [key]: true }))
    const next = validateProfileQuestions(panelQuestions, answers)
    const errorKey = `q-${key.replace(/__other$/, '')}`
    setErrors((current) => (next[errorKey] ? { ...current, [errorKey]: next[errorKey] } : omitKey(current, errorKey)))
  }

  function showStepErrors(index: number, source: AdditionalAnswerMap) {
    const nextQuestions = questionsForPanel(questions, panels[index]?.keys ?? [])
    const next = validateProfileQuestions(nextQuestions, source)
    setErrors(next)
    setTouched((current) => {
      const copy = { ...current }
      for (const question of nextQuestions) copy[question.key] = true
      return copy
    })
    const valid = Object.keys(next).length === 0
    if (!valid) focusFirstInvalid()
    return valid
  }

  function goTo(index: number) {
    setSaveError('')
    setErrors({})
    setStep(index)
  }

  function requestCancel() {
    if (dirty && !window.confirm('Leave this profile? Answers that have not been saved will be lost.')) return
    onCancel()
  }

  async function onNext() {
    if (!showStepErrors(step, answers)) return
    if (!lastStep) {
      goTo(step + 1)
      return
    }
    for (let index = 0; index < panels.length; index += 1) {
      const nextQuestions = questionsForPanel(questions, panels[index].keys)
      if (Object.keys(validateProfileQuestions(nextQuestions, answers)).length > 0) {
        setStep(index)
        showStepErrors(index, answers)
        return
      }
    }
    if (saveInFlight.current) return
    saveInFlight.current = true
    setSaving(true)
    setSaveError('')
    try {
      const payload = buildAnswerPayload(questions, answers)
      const exists = Boolean(sessionProfileRecord(kind))
      if (exists) await additionalProfileService.update(kind, answers, payload)
      else await additionalProfileService.create(kind, answers, payload)
      onSaved()
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Your profile could not be saved. Please try again.'
      setSaveError(message)
      if (error instanceof ApiRequestError && error.status === 409) {
        void additionalProfileService.getState().catch(() => undefined)
      }
    } finally {
      saveInFlight.current = false
      setSaving(false)
    }
  }

  if (questionsState.loading) return <LoadingSkeleton rows={4} />
  if (questionsState.error) return <ErrorState message={questionsState.error} onRetry={questionsState.reload} />
  if (!panel) {
    return <EmptyState title="No questions are available for this profile." description="Please try again later." />
  }

  return (
    <Card>
      <CardContent className="grid gap-5 pt-6">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
            Step {step + 1} of {panels.length}
          </p>
          <h2 className="font-display mt-2 text-2xl text-ink">{panel.title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">{panel.description}</p>
        </div>
        <AdditionalProfileFields
          questions={panelQuestions}
          answers={answers}
          errors={errors}
          onChange={onChange}
          onToggle={onToggle}
          onBlur={onBlur}
        />
        {saveError ? (
          <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {saveError}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={saving} onClick={() => (step === 0 ? requestCancel() : goTo(step - 1))}>
            {step === 0 ? 'Back' : 'Previous'}
          </Button>
          <Button type="button" disabled={saving} onClick={() => void onNext()}>
            {saving ? 'Saving…' : lastStep ? additionalProfileCompleteLabel[kind] : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
