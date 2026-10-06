import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { RewardMethod } from '@/content/rewardMethods'

function monogram(name: string) {
  const letters = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/)
  return (letters.length > 1 ? letters[0][0] + letters[1][0] : name.slice(0, 2)).toUpperCase()
}

export function RewardMethodMark({
  method,
  size = 'md',
  decorative = false,
  className,
}: {
  method: Pick<RewardMethod, 'name' | 'image'>
  size?: 'sm' | 'md' | 'lg'
  /** Set when the method name is already visible next to the mark, so it isn't announced twice. */
  decorative?: boolean
  className?: string
}) {
  const [failedImage, setFailedImage] = useState('')
  const sizeClass =
    size === 'sm' ? 'size-7 rounded-lg' : size === 'lg' ? 'size-12 rounded-2xl' : 'size-9 rounded-xl'
  const showImage = Boolean(method.image) && failedImage !== method.image

  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center overflow-hidden border border-line/70 bg-white shadow-soft',
        sizeClass,
        className,
      )}
    >
      {showImage ? (
        <img
          src={method.image}
          alt=""
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedImage(method.image)}
          aria-hidden
        />
      ) : (
        <span
          className={cn('font-semibold text-brand', size === 'sm' ? 'text-[10px]' : 'text-xs')}
          aria-hidden
        >
          {monogram(method.name)}
        </span>
      )}
      {decorative ? null : <span className="sr-only">{method.name}</span>}
    </span>
  )
}
