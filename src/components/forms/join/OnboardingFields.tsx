import { useState, type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input, ReadOnlyInput } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { SearchableSelect } from '@/components/forms/SearchableSelect'
import { countMaxDigits, isCountQuestion, rejectedCountMessage, sanitizeCount } from '@/lib/countField'
import { isPostalQuestionLabel, postalRuleForCountry, sanitizePostalInput } from '@/lib/postalCode'
import { answerDisplay, isCountryQuestion, isOtherLabel, type AnswerValue, type AnswerValues, type FormOption, type FormQuestion } from '@/lib/profileQuestions'
import { cn } from '@/lib/utils'

function fieldId(question: FormQuestion) {
  return `q-${question.key.replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

function ChoiceGroup({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  required: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return (
    <fieldset id={id} aria-describedby={describedBy} className="space-y-2">
      <legend className="mb-2 text-sm font-medium text-ink-soft">
        {label}
        {required ? (
          <>
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}

function selectedIds(value: AnswerValue | undefined) {
  if (Array.isArray(value)) return value
  return typeof value === 'string' && value ? [value] : []
}

function otherChoice(question: FormQuestion) {
  return question.options.find((option) => isOtherLabel(option.label))
}

function toggleOption(selected: string[], option: FormOption) {
  if (selected.includes(option.value)) return selected.filter((item) => item !== option.value)
  return [...selected, option.value]
}

const optionClass =
  'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm leading-5 text-ink transition-colors hover:border-brand/50 focus-within:ring-2 focus-within:ring-brand/20'

export function OnboardingFields({
  questions,
  values,
  errors,
  onChange,
  onBlur,
  readOnlyKeys = [],
  className,
}: {
  questions: FormQuestion[]
  values: AnswerValues
  errors: Record<string, string>
  onChange: (key: string, value: AnswerValue) => void
  onBlur?: (key: string) => void
  /** Question ids that stay visible but cannot be changed. */
  readOnlyKeys?: readonly string[]
  className?: string
}) {
  const [countHints, setCountHints] = useState<Record<string, string>>({})
  const countryQuestion = questions.find((question) => isCountryQuestion(question))
  const postalQuestion = questions.find((question) => isPostalQuestionLabel(question.label))
  const countryValue = countryQuestion && typeof values[countryQuestion.key] === 'string' ? values[countryQuestion.key] : ''
  const countryLabel = countryQuestion?.options.find((option) => option.value === countryValue)?.label ?? ''

  function changeAnswer(question: FormQuestion, next: AnswerValue) {
    onChange(question.key, next)
    const other = otherChoice(question)
    if (other && !selectedIds(next).includes(other.value)) onChange(`${question.key}__other`, '')
    if (!isCountryQuestion(question) || !postalQuestion || typeof next !== 'string') return
    const current = values[postalQuestion.key]
    if (typeof current !== 'string' || !current) return
    const nextCountry = question.options.find((option) => option.value === next)?.label ?? ''
    const cleaned = sanitizePostalInput(nextCountry, current)
    if (cleaned !== current) onChange(postalQuestion.key, cleaned)
  }

  return (
    <div className={cn('grid gap-5', className)}>
      {questions.map((question) => {
        const id = fieldId(question)
        const error = errors[`q-${question.key}`]
        const value = values[question.key]

        if (readOnlyKeys.includes(question.key)) {
          return (
            <Field key={question.key} label={question.label} htmlFor={id} required={question.required} hint={question.hint}>
              <ReadOnlyInput id={id} value={answerDisplay(question, value)} />
            </Field>
          )
        }

        if (question.fieldType === 'text') {
          const postal = isPostalQuestionLabel(question.label)
          const count = isCountQuestion(question.label)
          const rule = postal ? postalRuleForCountry(countryLabel) : null
          const digits = count ? countMaxDigits(question.label) : undefined
          return (
            <Field key={question.key} label={question.label} htmlFor={id} required={question.required} error={countHints[question.key] || error} hint={question.hint}>
              <Input
                id={id}
                type="text"
                inputMode={count || rule?.mode === 'digits' || rule?.mode === 'zip' ? 'numeric' : undefined}
                autoComplete={postal ? 'postal-code' : undefined}
                maxLength={digits ?? rule?.maxLength ?? question.maxLength}
                aria-required={question.required || undefined}
                value={typeof value === 'string' ? value : ''}
                onBlur={() => onBlur?.(question.key)}
                onChange={(event) => {
                  const raw = event.target.value
                  const next = count
                    ? sanitizeCount(raw, digits ?? 7)
                    : postal
                      ? sanitizePostalInput(countryLabel, raw)
                      : raw
                  if (count) {
                    const message = rejectedCountMessage(raw, digits ?? 7)
                    setCountHints((current) => ((current[question.key] ?? '') === message ? current : { ...current, [question.key]: message }))
                  }
                  onChange(question.key, next)
                  if (postal || count) onBlur?.(question.key)
                }}
              />
            </Field>
          )
        }

        if (question.fieldType === 'dropdown') {
          const current = typeof value === 'string' ? value : ''
          const searchable = question.options.length > 12 || question.options.some((option) => option.parentValue)
          const specify = error === 'Please specify your answer.'
          return (
            <div key={question.key} className="grid gap-3">
            <Field label={question.label} htmlFor={id} required={question.required} error={specify ? undefined : error} hint={question.hint}>
              {searchable ? (
                <SearchableSelect
                  id={id}
                  options={question.options.map((option) => ({
                    value: option.label,
                    group: option.parentValue
                      ? question.options.find((item) => item.value === option.parentValue)?.label
                      : undefined,
                  }))}
                  value={question.options.find((option) => option.value === current)?.label ?? ''}
                  invalid={Boolean(error)}
                  placeholder="Search options…"
                  onBlur={() => onBlur?.(question.key)}
                  onChange={(label) => {
                    const match = question.options.find((option) => option.label === label)
                    changeAnswer(question, match?.value ?? '')
                  }}
                />
              ) : (
                <Select
                  id={id}
                  value={current}
                  placeholder="Select an option"
                  options={question.options}
                  aria-required={question.required || undefined}
                  onBlur={() => onBlur?.(question.key)}
                  onChange={(event) => changeAnswer(question, event.target.value)}
                />
              )}
            </Field>
            <OtherAnswer question={question} id={id} values={values} error={specify ? error : undefined} onChange={onChange} onBlur={onBlur} />
            </div>
          )
        }

        if (question.fieldType === 'checkbox') {
          const selected = Array.isArray(value) ? value : typeof value === 'string' && value ? [value] : []
          const specify = error === 'Please specify your answer.'
          return (
            <div key={question.key} className="grid gap-3">
            <ChoiceGroup id={id} label={question.label} required={question.required} hint={question.hint} error={specify ? undefined : error}>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const checked = selected.includes(option.value)
                  return (
                    <label key={option.value} className={cn(optionClass, checked ? 'border-brand bg-brand-soft/50' : 'border-line')}>
                      <Checkbox
                        checked={checked}
                        aria-invalid={Boolean(error) || undefined}
                        onCheckedChange={() => changeAnswer(question, toggleOption(selected, option))}
                      />
                      <span className="min-w-0 flex-1">{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </ChoiceGroup>
            <OtherAnswer question={question} id={id} values={values} error={specify ? error : undefined} onChange={onChange} onBlur={onBlur} />
            </div>
          )
        }

        const specify = error === 'Please specify your answer.'
        return (
          <div key={question.key} className="grid gap-3">
          <ChoiceGroup id={id} label={question.label} required={question.required} hint={question.hint} error={specify ? undefined : error}>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const checked = value === option.value || (Array.isArray(value) && value.includes(option.value))
                return (
                  <label key={option.value} className={cn(optionClass, 'rounded-2xl', checked ? 'border-brand bg-brand-soft/50' : 'border-line')}>
                    <input
                      type="radio"
                      className="mt-0.5 size-4 shrink-0 accent-brand"
                      name={id}
                      value={option.value}
                      checked={checked}
                      required={question.required}
                      aria-invalid={Boolean(error) || undefined}
                      onChange={() => changeAnswer(question, option.value)}
                    />
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </label>
                )
              })}
            </div>
          </ChoiceGroup>
          <OtherAnswer question={question} id={id} values={values} error={specify ? error : undefined} onChange={onChange} onBlur={onBlur} />
          </div>
        )
      })}
    </div>
  )
}

function OtherAnswer({
  question,
  id,
  values,
  error,
  onChange,
  onBlur,
}: {
  question: FormQuestion
  id: string
  values: AnswerValues
  error?: string
  onChange: (key: string, value: AnswerValue) => void
  onBlur?: (key: string) => void
}) {
  const other = otherChoice(question)
  if (!other || !selectedIds(values[question.key]).includes(other.value)) return null
  const key = `${question.key}__other`
  const text = values[key]
  return (
    <Field label="If Other" htmlFor={`${id}-other`} required error={error}>
      <Input
        id={`${id}-other`}
        value={typeof text === 'string' ? text : ''}
        placeholder="Enter your answer"
        onBlur={() => onBlur?.(question.key)}
        onChange={(event) => onChange(key, event.target.value)}
      />
    </Field>
  )
}
