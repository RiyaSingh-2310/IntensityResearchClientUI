import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { MIN_DATE, formatIsoDate, monthGrid, parseIsoDate, todayIso } from '@/lib/dateField'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function DateField({
  id,
  value,
  onChange,
  onBlur,
  min = MIN_DATE,
  max,
  disabled = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  min?: string
  max?: string
  disabled?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const maxDate = max ?? todayIso()
  const selected = parseIsoDate(value)
  const [open, setOpen] = useState(false)
  const [dropUp, setDropUp] = useState(false)
  const [view, setView] = useState(() => {
    const parsed = parseIsoDate(value) ?? parseIsoDate(maxDate)
    return { year: parsed?.year ?? new Date().getFullYear(), month: parsed?.month ?? new Date().getMonth() + 1 }
  })

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onBlur, open])

  const minYear = Number(min.slice(0, 4)) || 1900
  const maxYear = Number(maxDate.slice(0, 4)) || new Date().getFullYear()
  const years: number[] = []
  for (let year = maxYear; year >= minYear; year -= 1) years.push(year)
  const cells = monthGrid(view.year, view.month)

  function openCalendar() {
    const parsed = parseIsoDate(value) ?? parseIsoDate(maxDate)
    if (parsed) setView({ year: parsed.year, month: parsed.month })
    const rect = rootRef.current?.getBoundingClientRect()
    const spaceBelow = window.innerHeight - (rect?.bottom ?? 0)
    setDropUp(spaceBelow < 340 && (rect?.top ?? 0) > spaceBelow)
    setOpen(true)
  }

  function choose(iso: string) {
    if (iso < min || iso > maxDate) return
    onChange(iso)
    setOpen(false)
    onBlur?.()
  }

  function shiftMonth(delta: number) {
    setView((current) => {
      const date = new Date(current.year, current.month - 1 + delta, 1)
      const year = Math.min(maxYear, Math.max(minYear, date.getFullYear()))
      const month = date.getFullYear() === year ? date.getMonth() + 1 : current.month
      return { year, month }
    })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        className={cn(
          'relative flex h-11 w-full items-center rounded-xl border border-line bg-white pr-10 pl-3.5 text-left text-sm shadow-soft focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:bg-paper/80 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/10',
          value ? 'text-ink' : 'text-muted',
        )}
        onClick={() => (open ? setOpen(false) : openCalendar())}
      >
        <span className="truncate">{formatIsoDate(value) || 'Select a date'}</span>
        <Calendar className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={listId}
          role="dialog"
          aria-label="Choose a date"
          className={cn(
            'absolute z-30 w-[19rem] max-w-full rounded-xl border border-line bg-white p-3 shadow-lift',
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1',
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <button type="button" className="grid size-8 place-items-center rounded-full text-ink hover:bg-brand-soft" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex min-w-0 items-center gap-1">
              <span className="text-sm font-medium text-ink">{MONTHS[view.month - 1]}</span>
              <select
                aria-label="Year"
                className="h-8 rounded-lg border border-line bg-white px-1.5 text-sm text-ink focus-visible:border-brand focus-visible:outline-none"
                value={view.year}
                onChange={(event) => setView((current) => ({ ...current, year: Number(event.target.value) }))}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="grid size-8 place-items-center rounded-full text-ink hover:bg-brand-soft" aria-label="Next month" onClick={() => shiftMonth(1)}>
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {WEEKDAYS.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const blocked = !cell.inMonth || cell.iso < min || cell.iso > maxDate
              const active = selected != null && cell.iso === value
              return (
                <button
                  key={cell.iso}
                  type="button"
                  disabled={blocked}
                  aria-pressed={active}
                  aria-label={formatIsoDate(cell.iso) || cell.iso}
                  className={cn(
                    'grid h-9 place-items-center rounded-lg text-sm',
                    active ? 'bg-brand text-white' : 'text-ink hover:bg-brand-soft',
                    blocked && 'cursor-default text-muted/40 hover:bg-transparent',
                  )}
                  onClick={() => choose(cell.iso)}
                >
                  {cell.day}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between">
            <button
              type="button"
              className="h-8 px-2 text-sm text-brand hover:underline"
              onClick={() => {
                onChange('')
                setOpen(false)
                onBlur?.()
              }}
            >
              Clear
            </button>
            <button type="button" className="h-8 px-2 text-sm text-brand hover:underline" onClick={() => choose(maxDate)}>
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
