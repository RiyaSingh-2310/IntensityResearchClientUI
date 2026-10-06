import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, ClipboardList, LogOut, Settings } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { paths } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'
import { useMotionConfig } from '@/lib/motion'
import { givenName, initials, mediaUrl } from '@/lib/utils'

const menuLinks = [
  { to: paths.surveys, label: 'My Surveys', icon: ClipboardList },
  { to: paths.settings, label: 'Settings', icon: Settings },
  // { to: `${paths.settings}#change-password`, label: 'Change Password', icon: KeyRound },
]

export function ProfileMenu({
  onNavigate,
  open = false,
  onOpenChange,
}: {
  onNavigate?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { duration } = useMotionConfig()
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange?.(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onOpenChange?.(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  if (!user) return null

  const photo = mediaUrl(user.photo)
  const firstName = givenName(user.name)

  async function onLogout() {
    onOpenChange?.(false)
    onNavigate?.()
    navigate(paths.home)
    await logout()
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex max-w-[11rem] items-center gap-2 rounded-full border border-line bg-white py-1 pr-2 pl-1 text-left text-ink shadow-soft transition-colors hover:border-brand/30 hover:bg-cream sm:max-w-[13rem] sm:pr-2.5"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => onOpenChange?.(!open)}
      >
        <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-[11px] font-semibold text-white">
          {photo ? <img src={photo} alt="" className="size-full object-cover" /> : initials(user.name)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-medium text-ink">{firstName}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration }}
            className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] origin-top-right overflow-hidden rounded-2xl border border-line bg-white p-2 text-ink shadow-lift"
          >
            <div className="rounded-xl px-3 py-2.5">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            {menuLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={label}
                role="menuitem"
                to={to}
                onClick={() => {
                  onOpenChange?.(false)
                  onNavigate?.()
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-cream hover:text-ink"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              onClick={() => void onLogout()}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-ink-soft transition-colors hover:bg-cream hover:text-ink"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
