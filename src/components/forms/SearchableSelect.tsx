import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export type SearchableOption = string | { value: string; label?: string; group?: string }

interface Choice {
  value: string
  label: string
  group?: string
}

function normalizeOption(option: SearchableOption): Choice {
  if (typeof option === 'string') return { value: option, label: option }
  return { value: option.value, label: option.label ?? option.value, group: option.group }
}

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
  options: SearchableOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  allowCustom?: boolean
  invalid?: boolean
  onBlur?: () => void
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const pointerOnList = useRef(false)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const choices = useMemo(() => options.map(normalizeOption), [options])
  const selected = choices.find((option) => option.value === value)

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return choices
    return choices.filter((option) => `${option.label} ${option.group ?? ''}`.toLowerCase().includes(needle))
  }, [choices, query])

  const custom =
    allowCustom && query.trim() && !choices.some((option) => option.label.toLowerCase() === query.trim().toLowerCase())
      ? query.trim()
      : ''

  const visible = useMemo(() => {
    const items: Array<Choice & { id: string }> = []
    if (custom) items.push({ value: custom, label: `Use “${custom}”`, id: `${listId}-custom` })
    matches.forEach((option, index) => {
      items.push({ ...option, id: `${listId}-opt-${index}` })
    })
    return items
  }, [custom, listId, matches])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const current = visible[active]
    if (!current) return
    document.getElementById(current.id)?.scrollIntoView({ block: 'nearest' })
  }, [active, open, visible])

  function choose(next: string) {
    onChange(next)
    setQuery('')
    setOpen(false)
    pointerOnList.current = false
  }

  const grouped = useMemo(() => {
    const groups: Array<{ label: string | null; options: Array<Choice & { id: string }> }> = []
    for (const option of visible) {
      if (option.value === custom && option.id.endsWith('-custom')) {
        groups.push({ label: null, options: [option] })
        continue
      }
      const label = option.group ?? null
      const last = groups[groups.length - 1]
      if (last && last.label === label) last.options.push(option)
      else groups.push({ label, options: [option] })
    }
    return groups
  }, [custom, visible])

  return (
    <div ref={rootRef} className="relative">
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? visible[active]?.id : undefined}
        aria-invalid={invalid || undefined}
        autoComplete="off"
        placeholder={selected && !open ? selected.label : placeholder}
        value={open ? query : (selected?.label ?? '')}
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
          if (pointerOnList.current) return
          setOpen(false)
          setQuery('')
          onBlur?.()
        }}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
          setActive(0)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setOpen(true)
            setActive((index) => Math.min(index + 1, Math.max(visible.length - 1, 0)))
          } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setOpen(true)
            setActive((index) => Math.max(index - 1, 0))
          } else if (event.key === 'Enter' && open) {
            event.preventDefault()
            const next = visible[active]
            if (next) choose(next.value)
          } else if (event.key === 'Escape') {
            setOpen(false)
            setQuery('')
          }
        }}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Close options' : 'Open options'}
        className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center text-muted"
        onPointerDown={(event) => event.preventDefault()}
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
          onPointerDown={() => {
            pointerOnList.current = true
          }}
          onPointerUp={() => {
            pointerOnList.current = false
          }}
          onPointerCancel={() => {
            pointerOnList.current = false
          }}
        >
          {grouped.map((group) => (
            <li key={group.label ?? group.options[0]?.id ?? 'options'} className="grid gap-0.5" role="presentation">
              {group.label ? <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted">{group.label}</p> : null}
              {group.options.map((option) => {
                const index = visible.findIndex((item) => item.id === option.id)
                const highlighted = index === active
                return (
                  <button
                    key={option.id}
                    type="button"
                    id={option.id}
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-left text-sm leading-5 text-ink hover:bg-brand-soft',
                      (highlighted || option.value === value) && 'bg-brand-soft',
                    )}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => choose(option.value)}
                  >
                    {option.label}
                  </button>
                )
              })}
            </li>
          ))}
          {visible.length === 0 ? <li className="px-3 py-2 text-sm text-muted">No matching options.</li> : null}
        </ul>
      ) : null}
    </div>
  )
}
