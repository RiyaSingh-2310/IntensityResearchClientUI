import { useMemo, useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  isQuestionVisible,
  otherAnswerKey,
  questionErrorKey,
  selectedKeys,
  type AdditionalAnswerMap,
  type ProfileQuestion,
} from '@/lib/additionalProfileForm'
import { SearchableSelect } from './SearchableSelect'

const RADIO_LIMIT = 8

export function AdditionalProfileFields({
  questions,
  answers,
  errors,
  onChange,
  onToggle,
  onBlur,
}: {
  questions: ProfileQuestion[]
  answers: AdditionalAnswerMap
  errors: Record<string, string>
  onChange: (key: string, value: string | string[]) => void
  onToggle: (question: ProfileQuestion, optionKey: string) => void
  onBlur?: (key: string) => void
}) {
  const shown = questions.filter((question) => isQuestionVisible(question, answers))

  return (
    <div className="grid gap-5">
      {shown.map((question) => (
        <ProfileField
          key={question.key}
          question={question}
          answers={answers}
          error={errors[questionErrorKey(question.key)]}
          onChange={onChange}
          onToggle={onToggle}
          onBlur={onBlur}
        />
      ))}
    </div>
  )
}

function ProfileField({
  question,
  answers,
  error,
  onChange,
  onToggle,
  onBlur,
}: {
  question: ProfileQuestion
  answers: AdditionalAnswerMap
  error?: string
  onChange: (key: string, value: string | string[]) => void
  onToggle: (question: ProfileQuestion, optionKey: string) => void
  onBlur?: (key: string) => void
}) {
  const id = question.key
  const other = question.options.find((option) => option.isOther)
  const selected = selectedKeys(answers[question.key])
  const showOther = Boolean(other && selected.includes(other.key))
  const otherValue = typeof answers[otherAnswerKey(question.key)] === 'string' ? answers[otherAnswerKey(question.key)] : ''
  const otherMissing = showOther && !String(otherValue).trim()
  const fieldError = otherMissing ? undefined : error

  if (question.fieldType === 'text') {
    const value = typeof answers[question.key] === 'string' ? answers[question.key] : ''
    return (
      <Field label={question.label} htmlFor={id} required={question.required} error={error}>
        <Input
          id={id}
          value={value}
          placeholder="Enter your answer"
          onBlur={() => onBlur?.(question.key)}
          onChange={(event) => onChange(question.key, event.target.value)}
        />
      </Field>
    )
  }

  if (question.fieldType === 'multi') {
    return (
      <MultiField
        question={question}
        selected={selected}
        error={fieldError}
        showOther={showOther}
        otherValue={String(otherValue)}
        otherError={otherMissing ? error : undefined}
        onToggle={onToggle}
        onOther={(value) => onChange(otherAnswerKey(question.key), value)}
        onBlur={onBlur}
      />
    )
  }

  const useRadio = question.options.length > 0 && question.options.length <= RADIO_LIMIT && question.options.every((option) => !option.groupLabel)
  return (
    <div className="grid gap-3">
      {useRadio ? (
        <fieldset className="space-y-2" aria-describedby={fieldError ? `${id}-error` : undefined}>
          <legend className="text-sm font-medium text-ink-soft">
            {question.label}
            {question.required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
          </legend>
          <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            {question.options.map((option) => (
              <label
                key={option.key}
                className={cn(
                  'flex min-h-11 items-center gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm text-ink',
                  selected[0] === option.key ? 'border-brand bg-brand-soft/50' : 'border-line',
                )}
              >
                <input
                  type="radio"
                  className="size-4 shrink-0 accent-brand"
                  name={id}
                  value={option.key}
                  checked={selected[0] === option.key}
                  onChange={() => onChange(question.key, option.key)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {fieldError ? (
            <p id={`${id}-error`} className="text-xs text-danger" role="alert">{fieldError}</p>
          ) : null}
        </fieldset>
      ) : (
        <Field label={question.label} htmlFor={id} required={question.required} error={fieldError}>
          <SearchableSelect
            id={id}
            options={question.options.map((option) => option.label)}
            value={question.options.find((option) => option.key === selected[0])?.label ?? ''}
            invalid={Boolean(error)}
            placeholder="Search options…"
            onBlur={() => onBlur?.(question.key)}
            onChange={(label) => {
              const match = question.options.find((option) => option.label === label)
              onChange(question.key, match?.key ?? '')
            }}
          />
        </Field>
      )}
      {showOther ? (
        <Field label="If Other" htmlFor={`${id}-other`} required error={otherMissing ? error : undefined}>
          <Input
            id={`${id}-other`}
            value={String(otherValue)}
            placeholder="Enter your answer"
            onBlur={() => onBlur?.(otherAnswerKey(question.key))}
            onChange={(event) => onChange(otherAnswerKey(question.key), event.target.value)}
          />
        </Field>
      ) : null}
    </div>
  )
}

function MultiField({
  question,
  selected,
  error,
  showOther,
  otherValue,
  otherError,
  onToggle,
  onOther,
  onBlur,
}: {
  question: ProfileQuestion
  selected: string[]
  error?: string
  showOther: boolean
  otherValue: string
  otherError?: string
  onToggle: (question: ProfileQuestion, optionKey: string) => void
  onOther: (value: string) => void
  onBlur?: (key: string) => void
}) {
  const [query, setQuery] = useState('')
  const id = question.key
  const needle = query.trim().toLowerCase()
  const groups = useMemo(() => {
    const visible = needle
      ? question.options.filter((option) => option.label.toLowerCase().includes(needle) || option.groupLabel?.toLowerCase().includes(needle))
      : question.options
    const next: Array<{ label: string | null; options: ProfileQuestion['options'] }> = []
    for (const option of visible) {
      const last = next[next.length - 1]
      if (last && last.label === option.groupLabel) last.options.push(option)
      else next.push({ label: option.groupLabel, options: [option] })
    }
    return next
  }, [needle, question.options])

  return (
    <fieldset className="space-y-3" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="text-sm font-medium text-ink-soft">
        {question.label}
        {question.required ? <span className="ml-1 text-danger" aria-hidden="true">*</span> : null}
      </legend>
      <p className="text-xs text-muted">Select all that apply</p>
      {question.options.length > RADIO_LIMIT ? (
        <Input value={query} placeholder="Search options…" onChange={(event) => setQuery(event.target.value)} />
      ) : null}
      {groups.map((group) => (
        <div key={group.label ?? 'options'} className="grid gap-2">
          {group.label ? <p className="text-xs font-semibold tracking-wide text-ink">{group.label}</p> : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {group.options.map((option) => {
              const checked = selected.includes(option.key)
              return (
                <label
                  key={option.key}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm leading-5 text-ink',
                    checked ? 'border-brand bg-brand-soft/50' : 'border-line',
                  )}
                >
                  <Checkbox checked={checked} onCheckedChange={() => onToggle(question, option.key)} />
                  <span className="min-w-0 flex-1">{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
      {groups.length === 0 ? <p className="text-sm text-muted">No matching options.</p> : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger" role="alert">{error}</p>
      ) : null}
      {showOther ? (
        <Field label="If Other" htmlFor={`${id}-other`} required error={otherError}>
          <Input
            id={`${id}-other`}
            value={otherValue}
            placeholder="Enter your answer"
            onBlur={() => onBlur?.(otherAnswerKey(question.key))}
            onChange={(event) => onOther(event.target.value)}
          />
        </Field>
      ) : null}
    </fieldset>
  )
}
