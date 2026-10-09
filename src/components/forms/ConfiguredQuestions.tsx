import { countries } from '@/content/countries'
import { visibleQuestions, type QuestionnaireAnswers, type QuestionnaireQuestion } from '@/content/questionnaires'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SearchableSelect } from './SearchableSelect'

const countryNames = countries.map((country) => country.name).sort((a, b) => a.localeCompare(b))

export function isOtherOption(value: string) {
  return /^(others?)$/i.test(value.trim())
}

function optionsFor(question: QuestionnaireQuestion) {
  return question.optionsFrom === 'countries' ? countryNames : question.options
}

function hasOtherChoice(question: QuestionnaireQuestion) {
  return question.otherInput || optionsFor(question).some((option) => isOtherOption(option))
}

export function applyConfiguredAnswer(answers: QuestionnaireAnswers, key: string, value: string) {
  const next = { ...answers, [key]: value }
  if (!key.endsWith('__other') && !isOtherOption(value)) delete next[`${key}__other`]
  return next
}

export function questionErrorKey(key: string) {
  return `q-${key}`
}

export function validateConfiguredQuestions(questions: QuestionnaireQuestion[], answers: QuestionnaireAnswers) {
  const errors: Record<string, string> = {}
  for (const question of visibleQuestions(questions, answers)) {
    const value = (answers[question.key] ?? '').trim()
    const other = (answers[`${question.key}__other`] ?? '').trim()
    const selection = question.fieldType === 'dropdown' || question.fieldType === 'dropdown-open' || question.fieldType === 'radio'
    if (question.required && !value) {
      errors[questionErrorKey(question.key)] = selection ? 'Please select an option.' : 'Please answer this question.'
    } else if (hasOtherChoice(question) && isOtherOption(value) && !other) {
      errors[questionErrorKey(question.key)] = 'Please specify your answer.'
    }
  }
  return errors
}

function placeholderFor(question: QuestionnaireQuestion) {
  if (question.placeholder) return question.placeholder
  if (question.optionsFrom === 'countries') return 'Search country…'
  if (question.fieldType === 'textarea') return 'Enter your response'
  if (question.fieldType === 'dropdown' || question.fieldType === 'dropdown-open') return 'Search options…'
  return 'Enter your answer'
}

export function ConfiguredQuestions({
  questions,
  answers,
  errors,
  onChange,
  onBlur,
}: {
  questions: QuestionnaireQuestion[]
  answers: QuestionnaireAnswers
  errors: Record<string, string>
  onChange: (key: string, value: string) => void
  onBlur?: (key: string) => void
}) {
  const shown = visibleQuestions(questions, answers)

  function changeAnswer(question: QuestionnaireQuestion, next: string) {
    onChange(question.key, next)
  }

  return (
    <div className="grid gap-5">
      {shown.map((question) => {
        const id = question.key
        const error = errors[questionErrorKey(question.key)]
        const value = answers[question.key] ?? ''
        const choices = optionsFor(question)
        const open = question.fieldType === 'dropdown-open'
        const showOther = hasOtherChoice(question) && isOtherOption(value)
        const otherMissing = showOther && !(answers[`${question.key}__other`] ?? '').trim()
        const fieldError = otherMissing ? undefined : error
        return (
          <div key={question.key} className="grid gap-3">
            {question.fieldType === 'radio' ? (
              <fieldset className="space-y-2" aria-describedby={fieldError ? `${id}-error` : undefined}>
                <legend className="text-sm font-medium text-ink-soft">
                  {question.label}
                  {question.required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
                </legend>
                <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                  {choices.map((option) => (
                    <label
                      key={option}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm text-ink',
                        value === option ? 'border-brand bg-brand-soft/50' : 'border-line',
                      )}
                    >
                      <input
                        type="radio"
                        className="size-4 shrink-0 accent-brand"
                        name={id}
                        value={option}
                        checked={value === option}
                        onChange={() => changeAnswer(question, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                {fieldError ? (
                  <p id={`${id}-error`} className="text-xs text-danger" role="alert">{fieldError}</p>
                ) : null}
              </fieldset>
            ) : question.fieldType === 'text' || question.fieldType === 'textarea' ? (
              <Field label={question.label} htmlFor={id} required={question.required} error={fieldError}>
                {question.fieldType === 'textarea' ? (
                  <Textarea id={id} value={value} placeholder={placeholderFor(question)} onBlur={() => onBlur?.(question.key)} onChange={(event) => changeAnswer(question, event.target.value)} />
                ) : (
                  <Input id={id} value={value} placeholder={placeholderFor(question)} onBlur={() => onBlur?.(question.key)} onChange={(event) => changeAnswer(question, event.target.value)} />
                )}
              </Field>
            ) : (
              <Field label={question.label} htmlFor={id} required={question.required} error={fieldError}>
                <SearchableSelect
                  id={id}
                  options={choices}
                  value={value}
                  allowCustom={open}
                  invalid={Boolean(error)}
                  placeholder={placeholderFor(question)}
                  onBlur={() => onBlur?.(question.key)}
                  onChange={(next) => changeAnswer(question, next)}
                />
              </Field>
            )}
            {showOther ? (
              <Field label="If Other" htmlFor={`${id}-other`} required error={otherMissing ? error : undefined}>
                <Input
                  id={`${id}-other`}
                  value={answers[`${question.key}__other`] ?? ''}
                  placeholder="Enter your answer"
                  onBlur={() => onBlur?.(`${question.key}__other`)}
                  onChange={(event) => onChange(`${question.key}__other`, event.target.value)}
                />
              </Field>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
