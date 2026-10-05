import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { categoryLabels } from '@/lib/paymentMethods'
import { cn } from '@/lib/utils'
import type { RewardOption } from '@/types/reward'

function MethodRow({ method }: { method: RewardOption }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <RewardMethodMark method={method} size="sm" decorative />
      <span className="truncate text-sm font-medium text-ink">{method.name}</span>
      <span className="hidden truncate text-xs text-muted sm:inline">· {categoryLabels[method.category]}</span>
    </span>
  )
}

export function RewardMethodSelect({
  value,
  onValueChange,
  methods,
  id,
  disabled,
  className,
}: {
  value: string
  onValueChange: (value: string) => void
  methods: RewardOption[]
  id?: string
  disabled?: boolean
  className?: string
}) {
  const selected = methods.find((method) => method.id === value)

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled || !methods.length}>
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3 text-left transition-colors hover:border-ink/25',
          'focus-visible:border-brand-mid focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'data-[placeholder]:text-muted',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={<span className="text-sm text-muted">Select a payout method</span>}>
          {selected ? <MethodRow method={selected} /> : null}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="shrink-0 text-muted">
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            'z-[60] max-h-[min(20rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-line bg-raised shadow-lift',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
          )}
        >
          <SelectPrimitive.Viewport className="themed-scrollbar p-1.5">
            {methods.map((method) => (
              <SelectPrimitive.Item
                key={method.id}
                value={method.id}
                className={cn(
                  'relative flex cursor-pointer items-center rounded-xl py-2.5 pr-9 pl-2.5 outline-none select-none',
                  'data-[highlighted]:bg-brand-soft data-[highlighted]:text-ink',
                  'data-[state=checked]:bg-surface',
                )}
              >
                <SelectPrimitive.ItemText>
                  <MethodRow method={method} />
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5 text-accent">
                  <Check className="size-4" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
