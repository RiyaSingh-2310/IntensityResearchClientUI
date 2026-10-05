import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'

export function NotFoundPage() {
  return (
    <div className="hero-grid flex min-h-svh flex-col items-center justify-center bg-paper px-4 text-center">
      <Logo />
      <p className="font-display mt-10 text-sm font-semibold tracking-[0.22em] text-signal uppercase">Error 404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold text-strong sm:text-5xl">This page isn’t here</h1>
      <p className="mt-3 max-w-md text-ink-soft">The link may be outdated. Head home or log in to your member dashboard.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Log in</Link>
        </Button>
      </div>
    </div>
  )
}
