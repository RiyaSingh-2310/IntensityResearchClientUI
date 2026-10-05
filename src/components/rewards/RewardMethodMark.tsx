import { createElement } from 'react'
import { paymentMethodIcon } from '@/lib/paymentMethods'
import { cn } from '@/lib/utils'
import type { RewardOption } from '@/types/reward'

const toneByCategory: Record<RewardOption['category'], string> = {
  cash: 'border-success/30 bg-success-soft text-success',
  'gift-card': 'border-signal/30 bg-signal-soft text-signal',
  digital: 'border-brand-mid/40 bg-brand-soft text-accent',
}

export function RewardMethodMark({
  method,
  size = 'md',
  decorative = false,
  className,
}: {
  method: Pick<RewardOption, 'name' | 'apiValue' | 'category'>
  size?: 'sm' | 'md' | 'lg'
  /** Set when the method name is already visible next to the mark, so it isn't announced twice. */
  decorative?: boolean
  className?: string
}) {
  const iconClass = size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-6' : 'size-5'
  const icon = createElement(paymentMethodIcon(method.apiValue || method.name), {
    className: iconClass,
    strokeWidth: 1.9,
    'aria-hidden': true,
  })
  const sizeClass =
    size === 'sm' ? 'size-7 rounded-lg' : size === 'lg' ? 'size-12 rounded-2xl' : 'size-10 rounded-xl'

  return (
    <span className={cn('inline-grid shrink-0 place-items-center border', toneByCategory[method.category], sizeClass, className)}>
      {icon}
      {decorative ? null : <span className="sr-only">{method.name}</span>}
    </span>
  )
}
