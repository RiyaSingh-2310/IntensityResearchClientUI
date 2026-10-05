import { Globe, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { brand } from '@/config/brand'
import { paths } from '@/config/paths'
import { useAuth } from '@/hooks/useAuth'

const linkClass =
  'inline-flex rounded py-0.5 text-sm text-ink-soft underline-offset-4 transition-colors hover:text-strong hover:underline'

export function PublicFooter() {
  const { user } = useAuth()

  const columns = [
    {
      title: 'Panel',
      links: [
        { to: paths.howItWorks, label: 'How It Works' },
        { to: paths.rewards, label: 'Rewards' },
        user ? { to: paths.dashboard, label: 'Dashboard' } : { to: paths.join, label: 'Join the Panel' },
        user ? { to: paths.surveys, label: 'My Surveys' } : { to: paths.login, label: 'Member Login' },
      ],
    },
    {
      title: 'Support',
      links: [
        { to: paths.help, label: 'Help Center' },
        { to: paths.contact, label: 'Contact Us' },
        { to: paths.about, label: 'About Us' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: paths.termsConditions, label: 'Terms & Conditions' },
        { to: paths.privacyPolicy, label: 'Privacy Policy' },
      ],
    },
  ]

  return (
    <footer className="border-t border-line bg-night text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8 lg:py-16">
        <div>
          <Logo to={paths.home} />
          <p className="mt-5 max-w-sm text-sm leading-7 text-ink-soft">
            A market research panel where your opinions help shape products, services, and brands — and earn you reward points along the way.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>
              <a href={`mailto:${brand.email}`} className={`${linkClass} items-center gap-2`}>
                <Mail className="size-4 text-accent" aria-hidden="true" />
                {brand.email}
              </a>
            </li>
            <li>
              <a href={brand.website} target="_blank" rel="noreferrer" className={`${linkClass} items-center gap-2`}>
                <Globe className="size-4 text-accent" aria-hidden="true" />
                {brand.websiteLabel}
              </a>
            </li>
          </ul>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="text-xs font-semibold tracking-[0.2em] text-signal uppercase">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p>Honest opinions. Protected privacy. Rewarded participation.</p>
        </div>
      </div>
    </footer>
  )
}
