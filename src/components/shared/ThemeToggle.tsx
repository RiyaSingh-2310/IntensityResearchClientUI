import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { applyTheme, currentTheme, type Theme } from '@/lib/theme'
import { useMotionConfig } from '@/lib/motion'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const { reduce } = useMotionConfig()
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = `Switch to ${next} theme`

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next)
        setTheme(next)
      }}
      aria-label={label}
      title={label}
      className="theme-float glass-panel fixed top-[5.25rem] right-3 z-20 grid size-10 place-items-center overflow-hidden rounded-full border border-line text-accent shadow-soft transition-[color,border-color,box-shadow] duration-200 hover:border-brand-mid/60 hover:text-strong hover:shadow-glow sm:right-5"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="grid place-items-center"
          initial={reduce ? false : { opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
        >
          {theme === 'dark' ? <Sun className="size-[18px]" aria-hidden="true" /> : <Moon className="size-[18px]" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
