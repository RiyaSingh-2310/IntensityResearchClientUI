import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useMotionConfig, easePremium } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function CtaSection({
  title,
  description,
  primary,
  secondary,
  className,
}: {
  title: ReactNode
  description: string
  primary: { to: string; label: string }
  secondary?: { to: string; label: string }
  className?: string
}) {
  const { duration, reduce } = useMotionConfig()

  return (
    <section className={cn('px-4 py-16 sm:px-6 lg:px-8', className)}>
      <motion.div
        className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-brand px-6 py-14 text-center text-white sm:px-10"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration, ease: easePremium }}
      >
        <h2 className="font-display text-3xl text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="accent">
            <Link to={primary.to}>{primary.label}</Link>
          </Button>
          {secondary ? (
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-white text-ink hover:bg-cream">
              <Link to={secondary.to}>{secondary.label}</Link>
            </Button>
          ) : null}
        </div>
      </motion.div>
    </section>
  )
}
