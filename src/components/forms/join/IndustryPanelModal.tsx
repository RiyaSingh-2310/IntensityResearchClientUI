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
  onClose,
}: {
  open: boolean
  options: AdditionalProfileKind[]
  selected: readonly AdditionalProfileKind[]
  onToggle: (kind: AdditionalProfileKind) => void
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <DialogContent
        title="Add a research panel"
        description="Choose the panels that match this industry. You can select more than one, then continue registration."
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
        <div className="mt-5 flex justify-end">
          <Button type="button" onClick={onClose}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
