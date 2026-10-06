import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { RewardMethod } from '@/content/rewardMethods'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { cn } from '@/lib/utils'

function MethodRow({ method }: { method: RewardMethod }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <RewardMethodMark method={method} size="sm" decorative />
      <span className="truncate text-sm font-medium text-ink">{method.name}</span>
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
  methods: RewardMethod[]
  id?: string
  disabled?: boolean
  className?: string
}) {
  const options = methods
  const selected = options.find((method) => method.id === value) ?? options[0]

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled || !options.length}>
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex h-12 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 text-left shadow-soft transition-colors',
          'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/10',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'data-[placeholder]:text-muted',
          className,
        )}
        aria-label="Reward method"
      >
        <SelectPrimitive.Value>
          {selected ? <MethodRow method={selected} /> : <span className="text-sm text-muted">Select a reward method</span>}
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
            'z-[60] max-h-[min(20rem,var(--radix-select-content-available-height))] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-line bg-white shadow-lift',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
          )}
        >
          <SelectPrimitive.Viewport className="themed-scrollbar p-1.5">
            {options.map((method) => (
              <SelectPrimitive.Item
                key={method.id}
                value={method.id}
                className={cn(
                  'relative flex cursor-pointer items-center rounded-xl py-2.5 pr-9 pl-2.5 outline-none select-none',
                  'data-[highlighted]:bg-brand-soft/70 data-[highlighted]:text-ink',
                  'data-[state=checked]:bg-cream',
                )}
              >
                <SelectPrimitive.ItemText>
                  <MethodRow method={method} />
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5 text-brand">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
