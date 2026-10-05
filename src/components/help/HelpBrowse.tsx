import { Gem, MessageCircle, Settings, Smartphone, TrendingUp } from 'lucide-react'
import { motion } from 'motion/react'
import { HelpArticleCard } from '@/components/help/HelpArticleCard'
import { Button } from '@/components/ui/button'
import { helpCategories } from '@/content/help'
import { easePremium, useMotionConfig } from '@/lib/motion'

const categoryIcons = {
  smartphone: Smartphone,
  trending: TrendingUp,
  gem: Gem,
  settings: Settings,
}

export function HelpBrowse({ query, onContact }: { query: string; onContact: () => void }) {
  const { duration, reduce } = useMotionConfig()
  const needle = query.trim().toLowerCase()
  const categories = helpCategories
    .map((category) => ({
      ...category,
      articles: category.articles.filter(
        (article) =>
          !needle ||
          article.title.toLowerCase().includes(needle) ||
          article.copy.toLowerCase().includes(needle) ||
          category.title.toLowerCase().includes(needle),
      ),
    }))
    .filter((category) => category.articles.length > 0)

  return (
    <div>
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-strong sm:text-4xl">Help topics</h2>
        <p className="mt-2 text-sm text-ink-soft sm:text-base">Short answers to the most common questions, grouped by topic.</p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {categories.map((category, index) => {
          const Icon = categoryIcons[category.icon]
          return (
            <motion.section
              key={category.id}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.05, ease: easePremium }}
            >
              <h3 className="flex items-center gap-3 font-display text-xl font-semibold text-strong">
                <span className="grid size-10 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {category.title}
              </h3>
              <div className="mt-4 grid gap-1">
                {category.articles.map((article) => (
                  <HelpArticleCard key={article.title} title={article.title} copy={article.copy} icon={article.icon} />
                ))}
              </div>
            </motion.section>
          )
        })}
      </div>

      {categories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-soft">No help articles match that search.</p>
      ) : null}

      <div className="surface-gradient mt-12 flex flex-col items-center gap-4 rounded-2xl border border-brand-mid/30 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-mid/30 bg-brand-soft text-accent">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-strong">Still need help?</h3>
            <p className="text-sm text-ink-soft">Send the panel team a message and we’ll reply by email.</p>
          </div>
        </div>
        <Button type="button" onClick={onContact} className="w-full sm:w-auto">
          Contact support
        </Button>
      </div>
    </div>
  )
}
