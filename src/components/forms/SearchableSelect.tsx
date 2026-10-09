import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function SearchableSelect({
  id,
  options,
  value,
  onChange,
  placeholder = 'Search',
  allowCustom = false,
  invalid = false,
  onBlur,
}: {
  id: string
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowCustom?: boolean
  invalid?: boolean
  onBlur?: () => void
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? options.filter((option) => option.toLowerCase().includes(needle)) : options
  }, [options, query])

  const custom =
    allowCustom && query.trim() && !options.some((option) => option.toLowerCase() === query.trim().toLowerCase())
      ? query.trim()
      : ''

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function choose(next: string) {
    onChange(next)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        autoComplete="off"
        placeholder={value && !open ? value : placeholder}
        value={open ? query : value}
        className={cn(
          'h-11 w-full rounded-xl border border-line bg-white px-3.5 pr-10 text-sm text-ink shadow-soft focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10',
          invalid && 'border-danger ring-4 ring-danger/10',
        )}
        onFocus={() => {
          setQuery('')
          setOpen(true)
          setActive(0)
        }}
        onBlur={() => {
          setOpen(false)
          setQuery('')
          onBlur?.()
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
          if (!event.target.value) onChange('')
        }}
        onKeyDown={(event) => {
          const choices = custom ? [custom, ...matches] : matches
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActive((index) => Math.min(index + 1, Math.max(choices.length - 1, 0)))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter' && open) {
            event.preventDefault()
            const next = choices[active]
            if (next) choose(next)
          } else if (event.key === 'Escape') {
            setOpen(false)
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Close options' : 'Open options'}
        className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center text-muted"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setOpen((current) => !current)
          setQuery('')
          setActive(0)
        }}
      >
        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="themed-scrollbar absolute z-30 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-lift"
        >
          {custom ? (
            <li>
              <button type="button" role="option" className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-brand-soft" onMouseDown={(event) => event.preventDefault()} onClick={() => choose(custom)}>
                Use “{custom}”
              </button>
            </li>
          ) : null}
          {matches.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === value}
                className={cn('w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-brand-soft', option === value && 'bg-brand-soft')}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                {option}
              </button>
            </li>
          ))}
          {!custom && matches.length === 0 ? <li className="px-3 py-2 text-sm text-muted">No matching options.</li> : null}
        </ul>
      ) : null}
    </div>
  )
}
