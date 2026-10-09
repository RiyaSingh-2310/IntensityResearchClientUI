import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { applyConfiguredAnswer, ConfiguredQuestions, questionErrorKey, validateConfiguredQuestions } from '@/components/forms/ConfiguredQuestions'
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
  questionPanels,
  questionsFor,
  type AdditionalProfileKind,
  type QuestionnaireAnswers,
  type QuestionnaireQuestion,
} from '@/content/questionnaires'
import { sessionProfile, useSessionProfiles } from '@/lib/additionalProfileSession'
import { omitKey } from '@/lib/utils'
import { ApiRequestError } from '@/services/errors'
import { additionalProfileService } from '@/services/additionalProfile.service'

function isKind(value: string | null): value is AdditionalProfileKind {
  return additionalProfileKinds.includes(value as AdditionalProfileKind)
}

export function AdditionalProfilePage() {
  const [params, setParams] = useSearchParams()
  const { answers, order } = useSessionProfiles()
  const requested = params.get('type')
  const view = params.get('view')
  const viewing = isKind(view) && answers[view] ? view : null
  const editing = isKind(requested) ? requested : null
  const stored = viewing ? answers[viewing] : undefined
  const introKind = editing ?? viewing
  const intro = introKind ? additionalProfileIntro[introKind] : null

  useEffect(() => {
    void additionalProfileService.getState().catch(() => {
      // The overview already shows the saved profiles. A refresh failure leaves them in place.
    })
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
        {editing ? (
          <PanelWizard
            key={editing}
            kind={editing}
            initial={answers[editing]}
            onCancel={() => setParams({})}
            onSaved={() => setParams({})}
          />
        ) : stored && viewing ? (
          <ProfileOverview
            kind={viewing}
            answers={stored}
            onEdit={() => setParams({ type: viewing })}
          />
        ) : (
          <Overview
            answers={answers}
            order={order}
            onOpen={(kind) => setParams({ view: kind })}
            onBegin={(kind) => setParams({ type: kind })}
          />
        )}
      </div>
    </div>
  )
}

function Overview({
  answers,
  order,
  onOpen,
  onBegin,
}: {
  answers: Partial<Record<AdditionalProfileKind, QuestionnaireAnswers>>
  order: AdditionalProfileKind[]
  onOpen: (kind: AdditionalProfileKind) => void
  onBegin: (kind: AdditionalProfileKind) => void
}) {
  const created = order.filter((kind) => answers[kind])
  const available = additionalProfileKinds.filter((kind) => !answers[kind])
  const preferred = defaultAdditionalProfileKind(available)
  const [picked, setPicked] = useState<AdditionalProfileKind | null>(preferred)
  const selected = picked && available.includes(picked) ? picked : preferred

  return (
    <div className="grid gap-4">
      {created.map((kind) => (
        <Card key={kind}>
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Users className="mt-1 size-4 shrink-0 text-brand" />
              <div>
                <h2 className="font-display text-2xl text-ink">{additionalProfileIntro[kind].title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{additionalProfileSummaries[kind]}</p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={() => onOpen(kind)}>
              View questions
            </Button>
          </CardContent>
        </Card>
      ))}
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
  answers: QuestionnaireAnswers
  onEdit: () => void
}) {
  const questions = questionsFor(kind)
  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button type="button" onClick={onEdit}>Edit</Button>
      </div>
      {questionPanels[kind].map((panel) => (
        <Card key={panel.id}>
          <CardContent className="pt-6">
            <h2 className="font-display text-2xl text-ink">{panel.title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{panel.description}</p>
            <dl className="mt-4">
              {panel.keys.map((key) => {
                const question = questions.find((item) => item.key === key)
                if (!question || (question.showIf && answers[question.showIf.key] !== question.showIf.equals)) return null
                const value = answers[key] === 'Other' ? answers[`${key}__other`] || 'Other' : answers[key]
                return (
                  <div key={key} className="grid gap-1 border-b border-line py-3 last:border-b-0 sm:grid-cols-2">
                    <dt className="text-sm text-muted">{question.label}</dt>
                    <dd className="text-sm font-medium break-words text-ink">{value || '—'}</dd>
                  </div>
                )
              })}
            </dl>
          </CardContent>
        </Card>
      ))}
      <Button asChild variant="outline" className="w-fit">
        <Link to={paths.additionalProfile}>Back to Additional Profile</Link>
      </Button>
    </div>
  )
}

function panelQuestions(kind: AdditionalProfileKind, keys: string[]) {
  const all = questionsFor(kind)
  return keys.map((key) => all.find((question) => question.key === key)).filter((question): question is QuestionnaireQuestion => Boolean(question))
}

function stepErrors(questions: QuestionnaireQuestion[], answers: QuestionnaireAnswers) {
  return validateConfiguredQuestions(questions, answers)
}

function PanelWizard({
  kind,
  initial,
  onCancel,
  onSaved,
}: {
  kind: AdditionalProfileKind
  initial?: QuestionnaireAnswers
  onCancel: () => void
  onSaved: () => void
}) {
  const panels = questionPanels[kind]
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(initial ? { ...initial } : {})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const panel = panels[step]
  const questions = useMemo(() => panelQuestions(kind, panel.keys), [kind, panel.keys])
  const lastStep = step === panels.length - 1

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  function onChange(key: string, value: string) {
    const nextAnswers = applyConfiguredAnswer(answers, key, value)
    setAnswers(nextAnswers)
    const errorKey = questionErrorKey(key.replace(/__other$/, ''))
    const next = stepErrors(questions, nextAnswers)
    setErrors((current) => {
      if (!touched[key] && !touched[errorKey.slice(2)] && !current[errorKey]) return current
      if (next[errorKey]) return { ...current, [errorKey]: next[errorKey] }
      return omitKey(current, errorKey)
    })
  }

  function onBlur(key: string) {
    setTouched((current) => ({ ...current, [key]: true }))
    const next = stepErrors(questions, answers)
    const errorKey = questionErrorKey(key.replace(/__other$/, ''))
    setErrors((current) => {
      const copy = { ...current }
      if (next[errorKey]) copy[errorKey] = next[errorKey]
      else delete copy[errorKey]
      return copy
    })
  }

  function showStepErrors(index: number, source: QuestionnaireAnswers) {
    const nextQuestions = panelQuestions(kind, panels[index].keys)
    const next = stepErrors(nextQuestions, source)
    setErrors(next)
    setTouched((current) => {
      const copy = { ...current }
      for (const question of nextQuestions) copy[question.key] = true
      return copy
    })
    return Object.keys(next).length === 0
  }

  function goTo(index: number) {
    setSaveError('')
    setErrors({})
    setStep(index)
  }

  async function onNext() {
    if (!showStepErrors(step, answers)) return
    if (!lastStep) {
      goTo(step + 1)
      return
    }
    for (let index = 0; index < panels.length; index += 1) {
      const nextQuestions = panelQuestions(kind, panels[index].keys)
      if (Object.keys(stepErrors(nextQuestions, answers)).length > 0) {
        setStep(index)
        showStepErrors(index, answers)
        return
      }
    }
    setSaving(true)
    setSaveError('')
    try {
      const exists = Boolean(sessionProfile(kind))
      if (exists) await additionalProfileService.update(kind, answers)
      else await additionalProfileService.create(kind, answers)
      onSaved()
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Your profile could not be saved. Please try again.'
      setSaveError(message)
    } finally {
      setSaving(false)
    }
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
        <p className="text-sm text-ink-soft">
          These answers stay in this browser session. They are not stored on your Intensity account yet.
        </p>
        <ConfiguredQuestions questions={questions} answers={answers} errors={errors} onChange={onChange} onBlur={onBlur} />
        {saveError ? (
          <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            {saveError}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" disabled={saving} onClick={() => (step === 0 ? onCancel() : goTo(step - 1))}>
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
