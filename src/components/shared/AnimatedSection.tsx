import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { useMotionConfig, reveal, easePremium } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function AnimatedSection({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const { reduce, duration } = useMotionConfig()

  return (
    <motion.div
      className={cn(className)}
      variants={reveal}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, delay, ease: easePremium }}
    >
      {children}
    </motion.div>
  )
}
