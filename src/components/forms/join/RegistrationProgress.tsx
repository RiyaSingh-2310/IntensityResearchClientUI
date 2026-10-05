import type { RegisterStep } from '@/lib/validation'
import { cn } from '@/lib/utils'

export function RegistrationProgress({
  steps,
  step,
  onSelect,
}: {
  steps: RegisterStep[]
  step: number
  onSelect: (index: number) => void
}) {
  const progress = ((step + 1) / steps.length) * 100
  const current = steps[step]

  return (
    <div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol
        className="mt-4 grid gap-1 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        aria-label={`Registration progress, ${steps.length} steps`}
      >
        {steps.map((item, index) => {
          const isCurrent = index === step
          const complete = index < step
          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > step}
                aria-label={`Step ${index + 1} of ${steps.length}: ${item.title}${complete ? ' (completed)' : ''}`}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-xl px-0.5 py-1 text-center text-[11px] sm:px-1 md:text-xs',
                  isCurrent && 'font-semibold text-accent',
                  complete && 'text-ink',
                  !isCurrent && !complete && 'text-muted',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full border text-[11px]',
                    isCurrent && 'border-brand bg-brand text-white',
                    complete && 'border-brand bg-brand-soft text-accent',
                    !isCurrent && !complete && 'border-line bg-surface',
                  )}
                >
                  {index + 1}
                </span>
                <span className="hidden max-w-full leading-tight break-words sm:block">{item.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
      {current ? (
        <p className="mt-2 text-center text-xs font-medium text-accent sm:hidden" aria-hidden="true">
          Step {step + 1} of {steps.length}: {current.title}
        </p>
      ) : null}
    </div>
  )
}
