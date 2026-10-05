import { BookOpen, CircleHelp, MessageCircle, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as Tabs from '@radix-ui/react-tabs'
import { ContactMethodCard } from '@/components/contact/ContactMethodCard'
import { ContactForm } from '@/components/forms/ContactForm'
import { HelpBrowse } from '@/components/help/HelpBrowse'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { contactMethods, helpContactIntro } from '@/content/contact'
import { helpFaqs, helpHero } from '@/content/help'
import { useMotionConfig, easePremium } from '@/lib/motion'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'browse', label: 'Browse help', short: 'Help', icon: BookOpen },
  { id: 'faq', label: 'FAQ', short: 'FAQ', icon: CircleHelp },
  { id: 'contact', label: 'Contact support', short: 'Contact', icon: MessageCircle },
] as const

type HelpTab = (typeof tabs)[number]['id']

function parseTab(value: string | null): HelpTab {
  if (value === 'faq' || value === 'contact') return value
  return 'browse'
}

export function HelpPage() {
  const [params, setParams] = useSearchParams()
  const tab = parseTab(params.get('tab'))
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const { duration, reduce } = useMotionConfig()

  const faqItems = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return helpFaqs
    return helpFaqs.filter((item) => item.q.toLowerCase().includes(needle) || item.a.toLowerCase().includes(needle))
  }, [query])

  function setTab(next: string) {
    const value = parseTab(next)
    const updated = new URLSearchParams(params)
    if (value === 'browse') updated.delete('tab')
    else updated.set('tab', value)
    setParams(updated, { replace: true })
  }

  const helpMethods = [
    { ...contactMethods[0], copy: helpContactIntro.emailCopy, detail: helpContactIntro.emailMeta },
    { ...contactMethods[2], copy: helpContactIntro.websiteCopy, detail: helpContactIntro.websiteMeta },
  ]

  return (
    <div>
      <PageHero
        beforeTitle={
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-2xl bg-surface text-accent shadow-soft">
            <CircleHelp className="size-6" />
          </div>
        }
        title={
          <>
            {helpHero.titleLead}
            <br />
            <span className="text-accent">{helpHero.titleAccent}</span>
          </>
        }
        description={helpHero.description}
      >
        <form
          className="mx-auto mt-8 flex w-full max-w-xl items-center overflow-hidden rounded-full border border-line bg-surface shadow-soft focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10"
          onSubmit={(event) => {
            event.preventDefault()
            setQuery(draft)
            if (tab !== 'browse' && tab !== 'faq') setTab('browse')
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Input
              aria-label="Search help"
              className="h-12 rounded-none border-0 pr-10 shadow-none focus-visible:ring-0"
              placeholder={helpHero.searchPlaceholder}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="button"
              aria-label="Clear search"
              className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              hidden={!draft}
              tabIndex={draft ? 0 : -1}
              onClick={() => {
                setDraft('')
                setQuery('')
              }}
            >
              <X className="size-4" />
            </button>
          </div>
          <Button type="submit" className="m-1 shrink-0 rounded-full">
            Search
          </Button>
        </form>
      </PageHero>

      <Tabs.Root value={tab} onValueChange={setTab} className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto -mt-6 max-w-4xl">
          <Tabs.List
            aria-label="Help sections"
            className="grid grid-cols-3 gap-1 rounded-[1.4rem] border border-line bg-surface p-1.5 shadow-card"
          >
            {tabs.map((item) => {
              const Icon = item.icon
              return (
                <Tabs.Trigger
                  key={item.id}
                  value={item.id}
                  aria-label={item.label}
                  className={cn(
                    'flex min-h-12 items-center justify-center gap-1.5 rounded-[1.1rem] px-1.5 py-3 text-center text-xs font-medium text-ink-soft transition-colors sm:gap-2 sm:px-3 sm:text-sm',
                    'data-[state=active]:bg-cream data-[state=active]:font-bold data-[state=active]:text-ink data-[state=active]:shadow-soft',
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span aria-hidden="true" className="sm:hidden">
                    {item.short}
                  </span>
                  <span aria-hidden="true" className="hidden sm:inline">
                    {item.label}
                  </span>
                </Tabs.Trigger>
              )
            })}
          </Tabs.List>
        </div>

        <Tabs.Content value="browse" className="mx-auto mt-12 max-w-6xl outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease: easePremium }}
          >
            <HelpBrowse query={query} onContact={() => setTab('contact')} />
          </motion.div>
        </Tabs.Content>
        <Tabs.Content value="faq" className="mx-auto mt-12 max-w-6xl outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease: easePremium }}
            className="mx-auto max-w-3xl"
          >
            <h2 className="text-center font-display text-3xl font-semibold text-strong sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-2 text-center text-sm text-ink-soft">Quick answers to the questions panelists ask most.</p>
            <FaqAccordion className="mt-10" items={faqItems} />
            {faqItems.length === 0 ? (
              <p className="mt-8 text-center text-sm text-ink-soft">No FAQs match that search.</p>
            ) : null}
          </motion.div>
        </Tabs.Content>
        <Tabs.Content value="contact" className="mx-auto mt-12 max-w-6xl outline-none">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease: easePremium }}
          >
            <h2 className="text-center font-display text-3xl font-semibold text-strong sm:text-4xl">{helpContactIntro.title}</h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-soft">{helpContactIntro.description}</p>
            <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
              {helpMethods.map((method) => (
                <ContactMethodCard
                  key={method.id}
                  title={method.title}
                  copy={method.copy}
                  detail={method.detail}
                  cta={method.cta}
                  href={method.href}
                  icon={method.icon}
                  accent={method.id === 'email'}
                />
              ))}
            </div>
            <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8">
              <h3 className="text-center font-display text-2xl font-semibold text-strong">Send us a message</h3>
              <p className="mt-2 text-center text-sm text-ink-soft">Fill out the form and we’ll reply by email.</p>
              <div className="mt-8">
                <ContactForm layout="simple" idPrefix="help-contact" />
              </div>
            </div>
          </motion.div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
