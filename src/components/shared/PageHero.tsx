import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { useMotionConfig, easePremium } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function PageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  beforeTitle,
}: {
  eyebrow?: string
  title: ReactNode
  description: string
  children?: ReactNode
  className?: string
  beforeTitle?: ReactNode
}) {
  const { duration, reduce } = useMotionConfig()

  return (
    <section className={cn('hero-grid relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-20', className)}>
      <motion.div
        className="relative mx-auto max-w-3xl text-center"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, ease: easePremium }}
      >
        {eyebrow ? <Badge tone="default">{eyebrow}</Badge> : null}
        {beforeTitle}
        <h1 className="font-display mt-5 text-4xl leading-[1.08] text-ink text-balance sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink-soft sm:text-lg">{description}</p>
        {children}
      </motion.div>
    </section>
  )
}
