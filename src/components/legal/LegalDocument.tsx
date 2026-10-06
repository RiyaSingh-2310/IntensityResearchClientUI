import { Link } from 'react-router-dom'
import { PageHero } from '@/components/shared/PageHero'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { brand } from '@/config/brand'
import { paths } from '@/config/paths'
import type { LegalBlock, LegalPageContent, LegalSection } from '@/content/legal'

const LINK_PATTERN = /(Privacy Policy|info@intensityresearch\.com|intensityresearch\.com)/g

function RichText({ text }: { text: string }) {
  const parts = text.split(LINK_PATTERN)
  return (
    <>
      {parts.map((part, index) => {
        if (part === 'Privacy Policy') {
          return (
            <Link key={`${part}-${index}`} to={paths.privacyPolicy} className="font-medium text-brand underline-offset-4 hover:underline">
              {part}
            </Link>
          )
        }
        if (part.includes('@')) {
          return (
            <a key={`${part}-${index}`} href={`mailto:${part}`} className="font-medium text-brand underline-offset-4 hover:underline">
              {part}
            </a>
          )
        }
        if (part === 'intensityresearch.com') {
          return (
            <a key={`${part}-${index}`} href={brand.website} target="_blank" rel="noreferrer" className="font-medium text-brand underline-offset-4 hover:underline">
              {part}
            </a>
          )
        }
        return <span key={`${part}-${index}`}>{part}</span>
      })}
    </>
  )
}

function Blocks({ blocks, sectionId }: { blocks: LegalBlock[]; sectionId: string }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.kind === 'list' && block.items) {
          return (
            <ul key={`${sectionId}-list-${index}`} className="list-disc space-y-2 pl-5 text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">
              {block.items.map((item) => (
                <li key={item}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.kind === 'note' && block.text) {
          return (
            <h4 key={`${sectionId}-note-${index}`} className="pt-1 text-base font-semibold text-ink">
              {block.text}
            </h4>
          )
        }
        return (
          <p key={`${sectionId}-p-${index}`} className="text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">
            <RichText text={block.text ?? ''} />
          </p>
        )
      })}
    </div>
  )
}

function sectionsFor(content: LegalPageContent, ids: string[]) {
  return ids
    .map((id) => content.sections.find((section) => section.id === id))
    .filter((section): section is LegalSection => section != null)
}

export function LegalDocument({
  content,
  layout,
  topics,
}: {
  content: LegalPageContent
  layout: 'accordion' | 'article'
  topics?: { id: string; title: string; sectionIds: string[] }[]
}) {
  return (
    <div>
      {layout === 'article' ? (
        <PageHero
          eyebrow="Terms of Service"
          title={
            <>
              Read these terms <span className="text-accent-deep">carefully</span>
            </>
          }
          description={content.description}
        />
      ) : (
        <PageHero
          eyebrow={content.eyebrow}
          title={
            <>
              Privacy <span className="text-accent-deep">Policy</span>
            </>
          }
          description={content.description}
        />
      )}
      {layout === 'accordion' ? (
        <AccordionLayout content={content} topics={topics ?? []} />
      ) : (
        <ArticleLayout content={content} />
      )}
    </div>
  )
}

function AccordionLayout({
  content,
  topics,
}: {
  content: LegalPageContent
  topics: { id: string; title: string; sectionIds: string[] }[]
}) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {content.updated ? <p className="mb-8 text-center text-sm text-muted">{content.updated}</p> : null}
        <Accordion type="single" collapsible className="grid gap-3">
          {topics.map((topic) => {
            const sections = sectionsFor(content, topic.sectionIds)
            return (
              <AccordionItem
                key={topic.id}
                value={topic.id}
                className="overflow-hidden rounded-2xl border border-line bg-white px-5 shadow-card data-[state=open]:border-brand/25 data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold sm:text-lg">{topic.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-8">
                    {topic.id === topics[0]?.id
                      ? content.intro.map((paragraph) => (
                          <p key={paragraph.slice(0, 40)} className="text-sm leading-7 text-ink-soft sm:text-base sm:leading-8">
                            <RichText text={paragraph} />
                          </p>
                        ))
                      : null}
                    {sections.map((section) => (
                      <div key={section.id} className="space-y-4 border-t border-line/80 pt-6 first:border-t-0 first:pt-0">
                        <h3 className="font-display text-xl text-ink">{section.title}</h3>
                        <Blocks blocks={section.blocks} sectionId={section.id} />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}

function ArticleLayout({ content }: { content: LegalPageContent }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="space-y-5">
          {content.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-sm leading-8 text-ink-soft sm:text-base">
              <RichText text={paragraph} />
            </p>
          ))}
        </div>
        <div className="mt-4">
          {content.sections.map((section) => (
            <article key={section.id} className="border-t border-line py-8">
              <h2 className="font-display text-2xl text-ink sm:text-3xl">{section.title}</h2>
              <div className="mt-4">
                <Blocks blocks={section.blocks} sectionId={section.id} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
