import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { NavItem } from '@/components/layout/NavItem'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { Logo } from '@/components/shared/Logo'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Button } from '@/components/ui/button'
import { memberNav, publicNav } from '@/config/brand'
import { paths } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, ready } = useAuth()
  const nav = user ? memberNav : publicNav
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  function closeMobile() {
    setMobileOpen(false)
  }

  function toggleMobile() {
    setMobileOpen((value) => {
      const next = !value
      if (next) setProfileOpen(false)
      return next
    })
  }

  function setProfile(next: boolean) {
    setProfileOpen(next)
    if (next) setMobileOpen(false)
  }

  function handleLogin() {
    closeMobile()
    navigate(paths.login)
  }

  function handleJoin() {
    closeMobile()
    navigate(paths.join)
  }

  const [seenPath, setSeenPath] = useState(location.pathname)
  if (seenPath !== location.pathname) {
    setSeenPath(location.pathname)
    setMobileOpen(false)
    setProfileOpen(false)
  }

  useEffect(() => {
    if (!mobileOpen) return

    const scrollY = window.scrollY
    const { style } = document.body
    const previous = {
      overflow: style.overflow,
      position: style.position,
      top: style.top,
      width: style.width,
    }
    style.overflow = 'hidden'
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.width = '100%'

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (menuRef.current?.contains(target) || toggleRef.current?.contains(target)) return
      setMobileOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      style.overflow = previous.overflow
      style.position = previous.position
      style.top = previous.top
      style.width = previous.width
      window.scrollTo(0, scrollY)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    function onChange() {
      if (media.matches) setMobileOpen(false)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-surface/95 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/88">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
            {nav.map((link) => (
              <NavItem key={`${link.to}-${link.label}`} to={link.to} end={'end' in link ? link.end : false}>
                {link.label}
              </NavItem>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {ready && user ? <ProfileMenu open={profileOpen} onOpenChange={setProfile} onNavigate={closeMobile} /> : null}
            {ready && !user ? (
              <div className="hidden items-center gap-2 lg:flex">
                <Button variant="ghost" type="button" onClick={handleLogin}>
                  Log in
                </Button>
                <Button type="button" onClick={handleJoin}>
                  Join the panel
                </Button>
              </div>
            ) : null}
            <button
              ref={toggleRef}
              type="button"
              className="relative z-40 grid size-10 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:border-brand-mid/60 hover:bg-raised lg:hidden"
              onClick={toggleMobile}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="size-5 text-ink" strokeWidth={2.25} /> : <Menu className="size-5 text-ink" strokeWidth={2.25} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
            <div
              id="mobile-nav"
              ref={menuRef}
              className="relative z-40 max-h-[calc(100svh-4.5rem)] overflow-y-auto border-t border-line bg-paper lg:hidden"
            >
              <div className="grid gap-1 px-4 py-4">
                {nav.map((link) => (
                  <NavItem
                    key={`mobile-${link.to}-${link.label}`}
                    to={link.to}
                    end={'end' in link ? link.end : false}
                    mobile
                    onClick={closeMobile}
                  >
                    {link.label}
                  </NavItem>
                ))}
                {ready && !user ? (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={handleLogin}>
                      Log in
                    </Button>
                    <Button type="button" onClick={handleJoin}>
                      Join the panel
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
        ) : null}
      </header>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={-1}
          className="fixed inset-0 z-30 cursor-default border-0 bg-[#0a1a36]/40 backdrop-blur-md lg:hidden"
          onClick={closeMobile}
        />
      ) : null}
    </>
  )
}
