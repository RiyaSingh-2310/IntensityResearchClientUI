import { BookOpen, Gift, LayoutDashboard, MessageCircle, Settings, Smartphone, TrendingUp, Gem } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { HelpArticleCard } from '@/components/help/HelpArticleCard'
import { paths } from '@/config/paths'
import { helpCategories } from '@/content/help'
import { useAuth } from '@/hooks/useAuth'
import { cardLiftClass, easePremium, useMotionConfig } from '@/lib/motion'
import { cn } from '@/lib/utils'

const categoryIcons = {
  smartphone: Smartphone,
  trending: TrendingUp,
  gem: Gem,
  settings: Settings,
}

const resourceCardClass = cn(
  'group flex h-full flex-col items-center rounded-[1.6rem] border border-line bg-white p-6 text-center shadow-card',
  cardLiftClass,
)

export function HelpBrowse({ query, onContact }: { query: string; onContact: () => void }) {
  const { user } = useAuth()
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

  const articleCount = helpCategories.reduce((sum, category) => sum + category.articles.length, 0)
  const stats = [
    { value: String(articleCount), label: 'Help articles', hint: 'Guides organized by topic' },
    { value: String(helpCategories.length), label: 'Help topics', hint: 'Account, surveys, rewards, and security' },
    { value: 'Email', label: 'Support channel', hint: 'The panel team replies by email' },
  ]

  const resources = [
    { to: paths.rewards, title: 'Rewards Catalog', copy: 'See the payout options enabled on the panel and the minimum payout.', cta: 'View Rewards', icon: Gift },
    { to: paths.howItWorks, title: 'How It Works', copy: 'Follow the four steps from sign-up to your first reward.', cta: 'Learn More', icon: BookOpen },
    user
      ? { to: paths.dashboard, title: 'Member Dashboard', copy: 'Check your points, assigned surveys, and recent activity.', cta: 'Open Dashboard', icon: LayoutDashboard }
      : { to: paths.login, title: 'Member Login', copy: 'Sign in to see your points, assigned surveys, and history.', cta: 'Login', icon: LayoutDashboard },
  ]

  return (
    <div>
      <div className="text-center">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">Help Categories</h2>
        <p className="mt-2 text-sm text-ink-soft sm:text-base">
          Browse our help articles organized by topic.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {categories.map((category, index) => {
          const Icon = categoryIcons[category.icon]
          return (
            <motion.section
              key={category.id}
              className="rounded-[1.6rem] border border-line bg-white p-5 shadow-card sm:p-6"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration, delay: reduce ? 0 : index * 0.05, ease: easePremium }}
            >
              <h3 className="flex items-center gap-3 font-display text-xl text-ink">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon className="size-5" />
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

      <div className="mt-10 grid gap-4 rounded-[1.6rem] border border-brand/15 bg-brand-soft/50 px-6 py-8 sm:grid-cols-3 sm:px-8">
        {stats.map((item) => (
          <div key={item.label} className="text-center">
            <p className="font-display text-3xl text-brand sm:text-4xl">{item.value}</p>
            <p className="mt-1 text-sm font-medium text-ink">{item.label}</p>
            <p className="mt-0.5 text-xs text-muted">{item.hint}</p>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <div className="text-center">
          <h2 className="font-display text-3xl text-ink">Additional Resources</h2>
          <p className="mt-2 text-sm text-ink-soft">Explore more ways to get help and make the most of the panel</p>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <button type="button" onClick={onContact} className={resourceCardClass}>
            <span className="grid h-20 w-full place-items-center overflow-hidden rounded-2xl bg-brand-soft text-brand">
              <MessageCircle className="size-10 transition-transform duration-200 motion-safe:group-hover:scale-105" />
            </span>
            <h3 className="mt-5 font-display text-xl text-ink">Contact Support</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">Send the panel team a message and we’ll reply by email.</p>
            <span className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-5 text-sm font-medium text-white">
              Send a Message
            </span>
          </button>
          {resources.map((item) => (
            <Link key={item.title} to={item.to} className={resourceCardClass}>
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5">
                <item.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{item.copy}</p>
              <span className="mt-5 inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-ink">
                {item.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
