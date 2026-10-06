import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { RewardMethodMark } from '@/components/rewards/RewardMethodMark'
import { showcaseRewardMethods, type RewardMethod } from '@/content/rewardMethods'
import { useMotionConfig } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** Home Popular Rewards shows 12 cards. Extra catalog entries stay available elsewhere. */
export const POPULAR_REWARDS_LIMIT = 12

function columnsForWidth(width: number) {
  if (width >= 1024) return 4
  if (width >= 640) return 3
  return 2
}

function chunk<T>(items: T[], size: number) {
  const pages: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size))
  }
  return pages
}

export function PopularRewardsCarousel({ methods }: { methods?: RewardMethod[] }) {
  const rewards = useMemo(
    () => (methods ?? showcaseRewardMethods).slice(0, POPULAR_REWARDS_LIMIT),
    [methods],
  )
  const { reduce } = useMotionConfig()
  const [perView, setPerView] = useState(() =>
    typeof window === 'undefined' ? 2 : columnsForWidth(window.innerWidth),
  )
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const update = () => setPerView(columnsForWidth(window.innerWidth))
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const pages = useMemo(() => chunk(rewards, perView), [rewards, perView])
  const pageCount = Math.max(pages.length, 1)
  const safePage = page >= pageCount ? 0 : page

  useEffect(() => {
    if (reduce || paused || pageCount <= 1) return
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % pageCount)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [reduce, paused, pageCount])

  function goTo(next: number) {
    setPage((next + pageCount) % pageCount)
  }

  return (
    <div
      className="mt-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="overflow-hidden" aria-roledescription="carousel" aria-label="Popular rewards">
        <div
          className={cn('flex', !reduce && 'transition-transform duration-500 ease-out')}
          style={{ transform: `translateX(-${safePage * 100}%)` }}
        >
          {pages.map((group, pageIndex) => (
            <div
              key={group.map((method) => method.id).join('-')}
              className="grid w-full shrink-0 gap-3 px-0.5"
              style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
              aria-hidden={pageIndex !== safePage}
            >
              {group.map((method) => (
                <article
                  key={method.id}
                  className="group flex h-full min-h-40 min-w-0 flex-col items-center justify-center gap-3 rounded-[1.4rem] border border-line/80 bg-white px-3 py-6 text-center shadow-card transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lift hover:border-brand/25"
                >
                  <RewardMethodMark
                    method={method}
                    size="lg"
                    decorative
                    className="transition-transform duration-200 motion-safe:group-hover:scale-105"
                  />
                  <div className="min-w-0">
                    <p className="w-full truncate text-sm font-medium text-ink">{method.name}</p>
                    {method.shortLabel ? <p className="mt-1 text-[11px] tracking-wide text-muted uppercase">{method.shortLabel}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-line bg-white text-ink shadow-soft transition-colors hover:border-brand/40 hover:text-brand"
          onClick={() => goTo(safePage - 1)}
          aria-label="Previous rewards"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Reward pages">
          {pages.map((group, index) => (
            <button
              key={group.map((method) => method.id).join('-')}
              type="button"
              role="tab"
              aria-selected={index === safePage}
              aria-label={`Show rewards ${index * perView + 1} to ${index * perView + group.length}`}
              className={cn(
                'relative h-2 rounded-full transition-all before:absolute before:-inset-x-1 before:-inset-y-3',
                index === safePage ? 'w-6 bg-brand' : 'w-2 bg-line hover:bg-brand/40',
              )}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-full border border-line bg-white text-ink shadow-soft transition-colors hover:border-brand/40 hover:text-brand"
          onClick={() => goTo(safePage + 1)}
          aria-label="Next rewards"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}
