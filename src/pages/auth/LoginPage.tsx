import { Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import { LoginForm } from '@/components/auth/LoginForm'
import { paths, returnPath } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'
import { useMotionConfig } from '@/lib/motion'

const welcomePoints = [
  'Track your points and rewards',
  'Review reward requests and history',
  'Update your profile anytime',
]

export function LoginPage() {
  const { user, ready } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { duration } = useMotionConfig()
  const view = location.pathname === paths.forgotPassword || location.pathname === paths.resetPassword ? 'forgot' : 'login'
  const from = (location.state as { from?: string } | null)?.from
  const resetToken = params.get('token') ?? ''

  if (!ready) return null
  if (user && location.pathname !== paths.resetPassword) return <Navigate to={returnPath(from)} replace />

  function showLogin() {
    navigate('/login', { replace: location.pathname !== '/login', state: { from } })
  }

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <motion.div
        className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-lift lg:grid-cols-[0.92fr_1.08fr]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration }}
      >
        <aside className="relative hidden overflow-hidden bg-brand-deep p-8 text-white lg:flex lg:flex-col lg:justify-center lg:p-10">
          <div className="relative">
            <p className="font-display text-4xl leading-tight">Welcome Back</p>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/80">
              Log in to access your points, rewards, and member account in one place.
            </p>
            <ul className="mt-8 space-y-3">
              {welcomePoints.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="grid size-7 place-items-center rounded-full bg-white/15">
                    <Check className="size-4" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <div className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-3xl text-ink">Welcome Back</p>
            <p className="mt-2 text-sm text-ink-soft">Log in to access your points, rewards, and member account.</p>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration }}
            >
              {view === 'forgot' ? (
                <>
                  <h1 id="member-login-title" className="font-display text-3xl text-ink sm:text-4xl">
                    {resetToken ? 'Reset Password' : 'Forgot Password?'}
                  </h1>
                  <p className="mt-2 text-sm text-ink-soft">
                    {resetToken ? 'Choose a new password for your member account.' : 'Enter the email on your member account.'}
                  </p>
                  <div className="mt-8">
                    <ForgotPasswordForm onBack={showLogin} initialToken={resetToken} />
                  </div>
                </>
              ) : (
                <>
                  <h1 id="member-login-title" className="font-display text-3xl text-ink sm:text-4xl">
                    Member Login
                  </h1>
                  <p className="mt-2 text-sm text-ink-soft">Please enter your account details below.</p>
                  <div className="mt-8">
                    <LoginForm
                      redirectTo={from}
                      onForgot={() => navigate(paths.forgotPassword, { state: { from } })}
                    />
                  </div>
                  <p className="mt-6 text-center text-sm text-ink-soft">
                    Don’t have an account?{' '}
                    <Link to="/join" className="font-medium text-brand hover:underline">
                      Join Now
                    </Link>
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
