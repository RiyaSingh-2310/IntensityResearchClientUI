import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-paper px-4 text-center">
      <Logo />
      <h1 className="font-display mt-10 text-5xl text-ink">This page isn’t here</h1>
      <p className="mt-3 max-w-md text-ink-soft">The link may be outdated. Head home or sign in to the panelist portal.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link to="/">Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/login">Login</Link>
        </Button>
      </div>
    </div>
  )
}
