import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, duration = 900, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const from = display
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(from + (value - from) * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // Animate from the displayed value when the target changes; `display` is intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep the current on-screen number as the animation origin
  }, [value, duration])

  return (
    <span>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}
