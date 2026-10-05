import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

interface FieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, required, error, hint, className, children }: FieldProps) {
  const autoId = useId()
  const describedById = `${htmlFor ?? autoId}-${error ? 'error' : 'hint'}`
  const describedBy = error || hint ? describedById : undefined
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ 'aria-invalid'?: boolean; 'aria-describedby'?: string }>, {
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': describedBy,
      })
    : children

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-1">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {control}
      {error ? (
        <p id={describedById} className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={describedById} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
