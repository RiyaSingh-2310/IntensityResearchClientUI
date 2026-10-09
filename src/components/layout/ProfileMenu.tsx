import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, LogOut, Settings, UserRound, Users } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { paths } from '@/config/paths'
import { additionalProfileKinds, additionalProfileLabels, type AdditionalProfileKind } from '@/content/questionnaires'
import { useAuth } from '@/hooks/useAuth'
import { useSessionProfiles } from '@/lib/additionalProfileSession'
import { useMotionConfig } from '@/lib/motion'
import { givenName, initials, mediaUrl } from '@/lib/utils'

const menuLinks = [
  { to: paths.profile, label: 'My Profile', icon: UserRound },
  // My Surveys stays implemented at paths.surveys. Hidden from this menu until it should return.
  // { to: paths.surveys, label: 'My Surveys', icon: ClipboardList },
  { to: paths.settings, label: 'Settings', icon: Settings },
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
  const submenuId = useId()
  const [profilesOpen, setProfilesOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)
  const { answers: sessionProfiles, order } = useSessionProfiles()
  const createdProfiles = order.filter((kind) => sessionProfiles[kind])
  const creatableProfiles = additionalProfileKinds.filter((kind) => !sessionProfiles[kind])

  function showProfiles() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setProfilesOpen(true)
  }

  function hideProfilesSoon() {
    closeTimer.current = window.setTimeout(() => setProfilesOpen(false), 200)
  }

  function closeProfiles() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setProfilesOpen(false)
  }

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange?.(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (profilesOpen) setProfilesOpen(false)
        else onOpenChange?.(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange, profilesOpen])

  useEffect(() => {
    if (!open) setProfilesOpen(false)
  }, [open])

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
            className="absolute right-0 z-50 mt-2 w-[min(16rem,calc(100vw-1.5rem))] origin-top-right rounded-2xl border border-line bg-white p-2 text-ink shadow-lift"
          >
            <div className="rounded-xl px-3 py-2.5">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="my-1 h-px bg-line" />
            <Link
              role="menuitem"
              to={paths.profile}
              onClick={() => {
                onOpenChange?.(false)
                onNavigate?.()
              }}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-cream hover:text-ink"
            >
              <UserRound className="size-4" />
              My Profile
            </Link>
            <AdditionalProfileMenu
              id={submenuId}
              open={profilesOpen}
              created={createdProfiles}
              creatable={creatableProfiles}
              onShow={showProfiles}
              onHide={hideProfilesSoon}
              onToggle={() => (profilesOpen ? closeProfiles() : showProfiles())}
              onNavigate={() => {
                onOpenChange?.(false)
                onNavigate?.()
              }}
            />
            {menuLinks.filter((link) => link.label !== 'My Profile').map(({ to, label, icon: Icon }) => (
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

function AdditionalProfileMenu({
  id,
  open,
  created,
  creatable,
  onShow,
  onHide,
  onToggle,
  onNavigate,
}: {
  id: string
  open: boolean
  created: AdditionalProfileKind[]
  creatable: AdditionalProfileKind[]
  onShow: () => void
  onHide: () => void
  onToggle: () => void
  onNavigate: () => void
}) {
  return (
    <div className="relative" onMouseEnter={onShow} onMouseLeave={onHide}>
      <div className="flex items-center rounded-xl hover:bg-cream">
        <Link
          role="menuitem"
          to={paths.additionalProfile}
          onClick={onNavigate}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft hover:text-ink"
        >
          <Users className="size-4" />
          Additional Profile
        </Link>
        <button
          type="button"
          aria-label="Show additional profiles"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={id}
          className="mr-1 grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:text-ink"
          onClick={onToggle}
          onKeyDown={(event) => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
              event.preventDefault()
              onShow()
            }
          }}
        >
          <ChevronDown className="size-4 -rotate-90" />
        </button>
      </div>
      {open ? (
        <div
          id={id}
          role="menu"
          className="mt-1 rounded-xl border border-line bg-white p-1 shadow-soft sm:absolute sm:top-0 sm:right-full sm:z-50 sm:mt-0 sm:mr-2 sm:w-64 sm:shadow-lift"
          onMouseEnter={onShow}
        >
          {created.map((kind) => (
            <Link
              key={kind}
              role="menuitem"
              to={`${paths.additionalProfile}?view=${kind}`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-cream hover:text-ink"
            >
              <Users className="size-4" />
              {additionalProfileLabels[kind]}
            </Link>
          ))}
          {creatable.length || created.length === 0 ? (
            <Link
              role="menuitem"
              to={`${paths.additionalProfile}?add=1`}
              onClick={onNavigate}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-cream"
            >
              <Users className="size-4" />
              Add Profile
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
