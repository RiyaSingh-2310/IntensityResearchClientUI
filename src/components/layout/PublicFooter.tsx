import { Link } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { brand } from '@/config/brand'
import { useAuth } from '@/hooks/useAuth'

type FooterLink = { to: string; label: string; external?: boolean }

const linkClass = 'inline-flex py-0.5 text-sm text-cream/75 underline-offset-4 transition-colors hover:text-white hover:underline'

export function PublicFooter() {
  const { user } = useAuth()

  const columns: Array<{ title: string; links: FooterLink[] }> = [
    {
      title: 'Platform',
      links: [
        { to: '/how-it-works', label: 'How It Works' },
        { to: '/rewards', label: 'Rewards' },
        { to: '/help', label: 'Help Center' },
        user ? { to: '/dashboard', label: 'Dashboard' } : { to: '/login', label: 'Member Portal' },
      ],
    },
    {
      title: 'Company',
      links: [
        { to: '/about', label: 'About Us' },
        { to: '/contact', label: 'Contact' },
        { to: `mailto:${brand.email}`, label: brand.email, external: true },
        { to: brand.website, label: brand.websiteLabel, external: true },
      ],
    },
    {
      title: 'Legal',
      links: [
        { to: '/terms-conditions', label: 'Terms & Conditions' },
        { to: '/privacy-policy', label: 'Privacy Policy' },
      ],
    },
  ]

  return (
    <footer className="border-t border-white/10 bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo variant="footer" to="/" />
          <p className="mt-5 max-w-sm text-sm leading-7 text-cream/70">
            Share your opinions and earn rewards with a trusted research panel built for privacy, fairness, and transparent payouts.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label} className="min-w-0">
                  {link.external ? (
                    <a
                      href={link.to}
                      className={`${linkClass} break-all`}
                      target={link.to.startsWith('http') ? '_blank' : undefined}
                      rel={link.to.startsWith('http') ? 'noreferrer' : undefined}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.to} className={linkClass}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-cream/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} {brand.name}. All rights reserved.</p>
          <p>Trusted research. Protected privacy. Real rewards.</p>
        </div>
      </div>
    </footer>
  )
}
