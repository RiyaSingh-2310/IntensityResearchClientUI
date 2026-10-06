import * as ProgressPrimitive from '@radix-ui/react-progress'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Progress({ className, value = 0, ...props }: ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-line', className)}
      value={value}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full rounded-full bg-accent transition-all"
        style={{ width: `${value}%` }}
      />
    </ProgressPrimitive.Root>
  )
}
