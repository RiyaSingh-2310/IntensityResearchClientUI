import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { additionalProfileLabels, type AdditionalProfileKind } from '@/content/questionnaires'
import { cn } from '@/lib/utils'

export function IndustryPanelModal({
  open,
  options,
  selected,
  onToggle,
  onContinue,
  onDismiss,
  error = '',
}: {
  open: boolean
  options: AdditionalProfileKind[]
  selected: readonly AdditionalProfileKind[]
  onToggle: (kind: AdditionalProfileKind) => void
  onContinue: () => void
  onDismiss: () => void
  error?: string
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onDismiss() }}>
      <DialogContent
        title="Add a research panel"
        description="Choose the panels you want to add for your industry. You can select more than one. Each panel is saved when you complete its questions."
      >
        <fieldset className="grid gap-2">
          <legend className="sr-only">Additional panels</legend>
          {options.map((kind) => {
            const checked = selected.includes(kind)
            return (
              <label
                key={kind}
                className={cn(
                  'flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border bg-white px-3 py-2.5 text-sm leading-5 text-ink transition-colors hover:border-brand/50',
                  checked ? 'border-brand bg-brand-soft/50' : 'border-line',
                )}
              >
                <Checkbox checked={checked} onCheckedChange={() => onToggle(kind)} />
                <span className="min-w-0 flex-1 font-medium">Add {additionalProfileLabels[kind]}</span>
              </label>
            )
          })}
        </fieldset>
        {error ? (
          <p className="mt-3 text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onDismiss}>
            Not now
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
