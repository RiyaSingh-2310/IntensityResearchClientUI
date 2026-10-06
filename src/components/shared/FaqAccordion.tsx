import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export interface FaqItem {
  q: string
  a: string
}

export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  return (
    <Accordion type="single" collapsible className={cn('grid gap-3', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.q}
          value={item.q}
          className="overflow-hidden rounded-2xl border-t border-r border-l bg-white px-5 shadow-card data-[state=open]:border-brand/25 data-[state=open]:shadow-soft"
        >
          <AccordionTrigger className="py-4 text-left text-base font-semibold sm:text-lg">{item.q}</AccordionTrigger>
          <AccordionContent className="text-ink-soft">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
