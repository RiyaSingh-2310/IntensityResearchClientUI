import type { ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { AnswerValue, AnswerValues, FormOption, FormQuestion } from '@/lib/profileQuestions'
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
}: {
  questions: FormQuestion[]
  values: AnswerValues
  errors: Record<string, string>
  onChange: (key: string, value: AnswerValue) => void
  onBlur?: (key: string) => void
}) {
  return (
    <div className="mt-6 grid gap-6">
      {questions.map((question) => {
        const id = fieldId(question)
        const error = errors[`q-${question.key}`]
        const value = values[question.key]

        if (question.fieldType === 'text') {
          return (
            <Field key={question.key} label={question.label} htmlFor={id} required={question.required} error={error} hint={question.hint}>
              <Input
                id={id}
                maxLength={question.maxLength}
                aria-required={question.required || undefined}
                value={typeof value === 'string' ? value : ''}
                onBlur={() => onBlur?.(question.key)}
                onChange={(event) => onChange(question.key, event.target.value)}
              />
            </Field>
          )
        }

        if (question.fieldType === 'dropdown') {
          return (
            <Field key={question.key} label={question.label} htmlFor={id} required={question.required} error={error} hint={question.hint}>
              <Select
                id={id}
                value={typeof value === 'string' ? value : ''}
                placeholder="Select an option"
                options={question.options}
                aria-required={question.required || undefined}
                onBlur={() => onBlur?.(question.key)}
                onChange={(event) => onChange(question.key, event.target.value)}
              />
            </Field>
          )
        }

        if (question.fieldType === 'checkbox') {
          const selected = Array.isArray(value) ? value : []
          return (
            <ChoiceGroup key={question.key} id={id} label={question.label} required={question.required} hint={question.hint} error={error}>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option) => {
                  const checked = selected.includes(option.value)
                  return (
                    <label key={option.value} className={cn(optionClass, checked ? 'border-brand bg-brand-soft/50' : 'border-line')}>
                      <Checkbox
                        checked={checked}
                        aria-invalid={Boolean(error) || undefined}
                        onCheckedChange={() => onChange(question.key, toggleOption(selected, option))}
                      />
                      <span className="min-w-0 flex-1">{option.label}</span>
                    </label>
                  )
                })}
              </div>
            </ChoiceGroup>
          )
        }

        return (
          <ChoiceGroup key={question.key} id={id} label={question.label} required={question.required} hint={question.hint} error={error}>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => {
                const checked = value === option.value
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
                      onChange={() => onChange(question.key, option.value)}
                    />
                    <span className="min-w-0 flex-1">{option.label}</span>
                  </label>
                )
              })}
            </div>
          </ChoiceGroup>
        )
      })}
    </div>
  )
}
