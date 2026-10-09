import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogClose = DialogPrimitive.Close

export function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { title: string; description?: string; children: ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=closed]:animate-[ir-fade-out_140ms_ease-in] data-[state=open]:animate-[ir-fade-in_180ms_ease-out] motion-reduce:animate-none" />
      <DialogPrimitive.Content
        {...props}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const content = event.currentTarget
          if (content instanceof HTMLElement) content.focus({ preventScroll: true })
        }}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 max-h-[92svh] w-[calc(100%-1.25rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-line bg-cream p-4 shadow-lift outline-none focus:outline-none focus-visible:outline-none data-[state=closed]:animate-[ir-dialog-out_140ms_ease-in] data-[state=open]:animate-[ir-dialog-in_180ms_ease-out] motion-reduce:animate-none sm:p-6',
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <DialogPrimitive.Title className="font-display text-2xl text-ink">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="mt-1 text-sm text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-brand/30 hover:bg-brand-soft hover:text-brand-deep focus:outline-none focus-visible:border-brand/40 focus-visible:bg-brand-soft focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 focus-visible:ring-offset-paper">
            <X className="size-4" strokeWidth={2.25} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
