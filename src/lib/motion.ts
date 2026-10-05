import { useReducedMotion } from 'motion/react'

export function useMotionConfig() {
  const reduce = useReducedMotion()
  return {
    reduce: Boolean(reduce),
    duration: reduce ? 0 : 0.35,
  }
}

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
}

export const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

export const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
}

export const easePremium = [0.22, 1, 0.36, 1] as const

export const cardLiftClass =
  'transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lift hover:border-brand/30'
